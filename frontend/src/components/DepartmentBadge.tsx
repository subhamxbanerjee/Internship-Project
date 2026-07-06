import type { IncidentDepartment } from '../types/incident';

const classes: Record<IncidentDepartment, string> = {
  HR: 'bg-slate-100 text-slate-700',
  ACCOUNTS: 'bg-cyan-100 text-cyan-700',
  IT: 'bg-indigo-100 text-indigo-700',
};

export function DepartmentBadge({ department }: { department: IncidentDepartment }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[department]}`}>
      {department}
    </span>
  );
}
