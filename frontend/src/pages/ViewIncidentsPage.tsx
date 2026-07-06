import { useEffect, useMemo, useState } from 'react';
import { Filter, PlusCircle, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import IncidentDetailsModal from '../components/IncidentDetailsModal';
import IncidentTable from '../components/IncidentTable';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  addIncidentComment,
  assignIncident,
  closeIncident,
  deleteIncident,
  fetchAssignableUsers,
  fetchIncidents,
  updateIncidentPriority,
  updateIncidentStatus,
} from '../services/incidentApi';
import type { Incident, IncidentUser } from '../types/incident';

const statusOptions = ['ALL', 'OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'];
const priorityOptions = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];
const departmentOptions = ['ALL', 'HR', 'ACCOUNTS', 'IT'];
const dateFilterOptions = ['ALL', 'TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS'];

function ViewIncidentsPage() {
  const { role } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<IncidentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [incidentData, assignableUsers] = await Promise.all([fetchIncidents(), fetchAssignableUsers()]);
      setIncidents(incidentData);
      setUsers(assignableUsers);
    } catch {
      setError('Could not load incidents. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const notification = sessionStorage.getItem('incident_created');
    if (notification) {
      setSuccessMessage(notification);
      sessionStorage.removeItem('incident_created');
    }
    loadData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, departmentFilter, assignedFilter, dateFilter, sortField, sortDirection]);

  const filteredIncidents = useMemo(() => {
    const filtered = incidents.filter((incident) => {
      const searchText = `${incident.incidentNumber} ${incident.title} ${incident.description} ${incident.department} ${incident.assignedTo || ''} ${incident.createdBy || ''}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || incident.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || incident.priority === priorityFilter;
      const matchesDepartment = departmentFilter === 'ALL' || incident.department === departmentFilter;
      const matchesAssigned = assignedFilter === 'ALL' || (incident.assignedTo || 'Unassigned') === assignedFilter;

      const createdAt = new Date(incident.createdAt).getTime();
      const now = Date.now();
      let matchesDate = true;
      if (dateFilter === 'TODAY') {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        matchesDate = createdAt >= start.getTime();
      } else if (dateFilter === 'LAST_7_DAYS') {
        matchesDate = createdAt >= now - 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === 'LAST_30_DAYS') {
        matchesDate = createdAt >= now - 30 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesAssigned && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
      }
      if (sortField === 'incidentNumber') {
        return a.incidentNumber.localeCompare(b.incidentNumber) * direction;
      }
      const valueA = String(a[sortField as keyof Incident] ?? '').toLowerCase();
      const valueB = String(b[sortField as keyof Incident] ?? '').toLowerCase();
      return valueA.localeCompare(valueB) * direction;
    });
  }, [incidents, search, statusFilter, priorityFilter, departmentFilter, assignedFilter, dateFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / pageSize));
  const pagedIncidents = filteredIncidents.slice((page - 1) * pageSize, page * pageSize);

  const handleAssign = async (incidentId: number, assignedTo: string) => {
    try {
      setActionBusy(true);
      const updated = await assignIncident(incidentId, assignedTo);
      setIncidents((prev) => prev.map((item) => (item.id === incidentId ? updated : item)));
      window.dispatchEvent(new Event('incidents:updated'));
      setSuccessMessage('Assignment synced successfully.');
    } catch {
      setError('Unable to assign the employee right now.');
    } finally {
      setActionBusy(false);
    }
  };

  const handlePriorityChange = async (incidentId: number, priority: string) => {
    try {
      setActionBusy(true);
      const updated = await updateIncidentPriority(incidentId, priority);
      setIncidents((prev) => prev.map((item) => (item.id === incidentId ? updated : item)));
      window.dispatchEvent(new Event('incidents:updated'));
      setSuccessMessage('Priority updated successfully.');
    } catch {
      setError('Unable to update priority right now.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleStatusChange = async (incidentId: number, status: string) => {
    try {
      setActionBusy(true);
      const updated = await updateIncidentStatus(incidentId, status);
      setIncidents((prev) => prev.map((item) => (item.id === incidentId ? updated : item)));
      window.dispatchEvent(new Event('incidents:updated'));
      setSuccessMessage('Status updated successfully.');
    } catch {
      setError('Unable to update incident status right now.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async (incidentId: number) => {
    if (!window.confirm('Delete this incident?')) return;
    try {
      setActionBusy(true);
      await deleteIncident(incidentId);
      setIncidents((prev) => prev.filter((item) => item.id !== incidentId));
      window.dispatchEvent(new Event('incidents:updated'));
      setSuccessMessage('Incident deleted successfully.');
    } catch {
      setError('Unable to delete the incident right now.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleClose = async (incidentId: number) => {
    try {
      setActionBusy(true);
      const updated = await closeIncident(incidentId);
      setIncidents((prev) => prev.map((item) => (item.id === incidentId ? updated : item)));
      window.dispatchEvent(new Event('incidents:updated'));
      setSuccessMessage('Incident closed successfully.');
    } catch {
      setError('Unable to close the incident right now.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleComment = async (incidentId: number, comment: string) => {
    if (!comment.trim()) return;
    try {
      setActionBusy(true);
      const updated = await addIncidentComment(incidentId, comment);
      setIncidents((prev) => prev.map((item) => (item.id === incidentId ? updated : item)));
      window.dispatchEvent(new Event('incidents:updated'));
      setSuccessMessage('Comment added successfully.');
    } catch {
      setError('Unable to save the comment right now.');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Incident Management</h1>
            <p className="mt-2 text-sm text-slate-500">Track incidents, coordinate assignments, and keep updates synchronized in real time.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {role !== 'EMPLOYEE' && (
              <Link to="/incidents/report" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                <PlusCircle size={16} /> Report Incident
              </Link>
            )}
            <button onClick={() => loadData()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Search size={14} /> Search
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search incidents..." className="w-full bg-transparent text-sm text-slate-900 outline-none" />
          </label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Filter size={14} /> Status
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none">
              {statusOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Filter size={14} /> Priority
            </div>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none">
              {priorityOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Filter size={14} /> Department
            </div>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none">
              {departmentOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Filter size={14} /> Assigned Employee
            </div>
            <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none">
              <option value="ALL">All employees</option>
              {users.map((user) => <option key={user.username} value={user.fullName}>{user.fullName}</option>)}
            </select>
          </label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Filter size={14} /> Created Date
            </div>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none">
              {dateFilterOptions.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ').toLowerCase()}</option>)}
            </select>
          </label>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}
      {actionBusy && <div className="flex items-center gap-2 text-sm text-slate-500"><RefreshCw size={16} className="animate-spin" /> Updating incident...</div>}

      <IncidentTable
        incidents={pagedIncidents}
        loading={loading}
        role={role}
        users={users}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(field) => {
          if (field === sortField) {
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
          } else {
            setSortField(field);
            setSortDirection('asc');
          }
        }}
        onSelect={setSelectedIncident}
        onAssign={handleAssign}
        onPriorityChange={handlePriorityChange}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onCloseIncident={handleClose}
        onComment={handleComment}
      />

      {filteredIncidents.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm shadow-slate-200">
          <div className="text-sm text-slate-500">Showing {Math.min((page - 1) * pageSize + 1, filteredIncidents.length)}–{Math.min(page * pageSize, filteredIncidents.length)} of {filteredIncidents.length} incidents</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-full border border-slate-200 px-3 py-2 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-full border border-slate-200 px-3 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {successMessage && <Toast message={successMessage} onClose={() => setSuccessMessage('')} />}
      <IncidentDetailsModal incident={selectedIncident} role={role} onClose={() => setSelectedIncident(null)} />
    </div>
  );
}

export default ViewIncidentsPage;
