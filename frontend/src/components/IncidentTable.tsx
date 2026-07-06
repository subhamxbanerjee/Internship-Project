import { ArrowUpDown, Eye, PencilLine, Trash2, UserRoundPlus } from 'lucide-react';
import { DepartmentBadge } from './DepartmentBadge';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import type { Incident, IncidentUser } from '../types/incident';

interface IncidentTableProps {
  incidents: Incident[];
  loading: boolean;
  role: string;
  users: IncidentUser[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  onSelect: (incident: Incident) => void;
  onAssign: (incidentId: number, assignedTo: string) => Promise<void>;
  onPriorityChange: (incidentId: number, priority: string) => Promise<void>;
  onStatusChange: (incidentId: number, status: string) => Promise<void>;
  onDelete: (incidentId: number) => Promise<void>;
  onCloseIncident: (incidentId: number) => Promise<void>;
  onComment: (incidentId: number, comment: string) => Promise<void>;
}

export default function IncidentTable({
  incidents,
  loading,
  role,
  users,
  sortField,
  sortDirection,
  onSortChange,
  onSelect,
  onAssign,
  onPriorityChange,
  onStatusChange,
  onDelete,
  onCloseIncident,
  onComment,
}: IncidentTableProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
        No incidents match the current filters.
      </div>
    );
  }

  const headers = [
    { key: 'incidentNumber', label: 'Incident Number' },
    { key: 'title', label: 'Title' },
    { key: 'department', label: 'Department' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'assignedTo', label: 'Assigned Employee' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'createdAt', label: 'Created Date' },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <button type="button" onClick={() => onSortChange(header.key)} className="flex items-center gap-1 hover:text-slate-700">
                    {header.label}
                    <ArrowUpDown size={12} className={sortField === header.key ? 'text-slate-700' : 'text-slate-400'} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {incidents.map((incident) => (
              <tr key={incident.id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => onSelect(incident)}>
                <td className="px-4 py-4 text-sm font-semibold text-blue-700">{incident.incidentNumber}</td>
                <td className="px-4 py-4 text-sm font-medium text-slate-900">{incident.title}</td>
                <td className="px-4 py-4"><DepartmentBadge department={incident.department} /></td>
                <td className="px-4 py-4"><PriorityBadge priority={incident.priority} /></td>
                <td className="px-4 py-4"><StatusBadge status={incident.status} /></td>
                <td className="px-4 py-4 text-sm text-slate-700">{incident.assignedTo || 'Unassigned'}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{incident.createdBy || '—'}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{new Date(incident.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onSelect(incident)} className="rounded-full p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700" title="View details">
                      <Eye size={16} />
                    </button>
                    {role !== 'EMPLOYEE' && (
                      <>
                        <select
                          defaultValue={incident.assignedTo || ''}
                          onChange={(event) => { event.stopPropagation(); void onAssign(incident.id, event.target.value); }}
                          className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user.username} value={user.username}>{user.fullName}</option>
                          ))}
                        </select>
                        <select
                          defaultValue={incident.priority}
                          onChange={(event) => { event.stopPropagation(); void onPriorityChange(incident.id, event.target.value); }}
                          className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                        </select>
                      </>
                    )}
                    {role === 'EMPLOYEE' ? (
                      <>
                        <select
                          defaultValue={incident.status}
                          onChange={(event) => { event.stopPropagation(); void onStatusChange(incident.id, event.target.value); }}
                          className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                        </select>
                        <button type="button" onClick={(event) => { event.stopPropagation(); void onComment(incident.id, window.prompt('Add comment') || ''); }} className="rounded-full p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700" title="Comment">
                          <PencilLine size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={(event) => { event.stopPropagation(); void onCloseIncident(incident.id); }} className="rounded-full p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" title="Close incident">
                          <UserRoundPlus size={16} />
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); void onDelete(incident.id); }} className="rounded-full p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="Delete incident">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
