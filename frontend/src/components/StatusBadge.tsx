import type { IncidentStatus } from '../types/incident';

const classes: Record<IncidentStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  PENDING_REVIEW: 'bg-violet-100 text-violet-700',
  CLOSED: 'bg-slate-200 text-slate-700',
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
