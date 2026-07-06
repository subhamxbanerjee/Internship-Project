import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignIncident, createIncident, fetchAssignableUsers } from '../services/incidentApi';
import type { IncidentUser } from '../types/incident';

const departments = ['HR', 'ACCOUNTS', 'IT'] as const;
const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

function ReportIncidentPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('HR');
  const [priority, setPriority] = useState('LOW');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState<IncidentUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignableUsers()
      .then(setUsers)
      .catch(() => setError('Could not load employees.'));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await createIncident({ title, description, department, priority });
      if (assignedTo) {
        await assignIncident(created.id, assignedTo);
      }
      sessionStorage.setItem('incident_created', 'Incident reported successfully and synced with the backend.');
      navigate('/incidents', { replace: true });
    } catch (err) {
      setError('Unable to create the incident right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Report Incident</h1>
        <p className="mt-2 text-sm text-slate-500">Submit a new incident and route it to the right team quickly.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Department</span>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900">
              {departments.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900">
              {priorities.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Assign Employee</span>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900">
              <option value="">Unassigned</option>
              {users.map((user) => <option key={user.username} value={user.username}>{user.fullName}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Incident'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportIncidentPage;
