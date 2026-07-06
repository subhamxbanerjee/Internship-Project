import type { IncidentPriority } from '../types/incident';

const classes: Record<IncidentPriority, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-rose-100 text-rose-700',
};

export function PriorityBadge({ priority }: { priority: IncidentPriority }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[priority]}`}>
      {priority}
    </span>
  );
}
