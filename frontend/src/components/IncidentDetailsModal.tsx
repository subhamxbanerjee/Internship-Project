import { Printer, X } from 'lucide-react';
import logo from '../assets/logo-new.png';
import { DepartmentBadge } from './DepartmentBadge';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import type { Incident } from '../types/incident';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  role: string;
  onClose: () => void;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function IncidentDetailsModal({ incident, role, onClose }: IncidentDetailsModalProps) {
  if (!incident) return null;

  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const reportHtml = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${incident.incidentNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; }
            .logo { height: 48px; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 16px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
            .value { margin-top: 4px; font-weight: 600; }
            .footer { margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <img class="logo" src="${logo}" alt="CenturyPly" />
              <h1 style="margin: 4px 0 0; font-size: 24px;">CenturyPly Internal Enterprise Portal</h1>
            </div>
            <div style="text-align: right; font-size: 13px; color: #64748b;">Generated ${new Date().toLocaleString()}</div>
          </div>
          <h2 style="margin: 20px 0 8px;">Incident Report</h2>
          <div class="card">
            <div class="label">Incident Number</div>
            <div class="value">${incident.incidentNumber}</div>
          </div>
          <div class="card">
            <div class="label">Title</div>
            <div class="value">${incident.title}</div>
          </div>
          <div class="card">
            <div class="label">Description</div>
            <div class="value">${incident.description}</div>
          </div>
          <div class="grid">
            <div class="card"><div class="label">Department</div><div class="value">${incident.department}</div></div>
            <div class="card"><div class="label">Priority</div><div class="value">${incident.priority}</div></div>
            <div class="card"><div class="label">Status</div><div class="value">${incident.status}</div></div>
            <div class="card"><div class="label">Assigned To</div><div class="value">${incident.assignedTo || 'Unassigned'}</div></div>
            <div class="card"><div class="label">Created By</div><div class="value">${incident.createdBy || '—'}</div></div>
            <div class="card"><div class="label">Created Date</div><div class="value">${formatDate(incident.createdAt)}</div></div>
            <div class="card"><div class="label">Updated Date</div><div class="value">${formatDate(incident.updatedAt)}</div></div>
            <div class="card"><div class="label">Closed By</div><div class="value">${incident.closedBy || '—'}</div></div>
            <div class="card"><div class="label">Closed Date</div><div class="value">${incident.closedAt ? formatDate(incident.closedAt) : '—'}</div></div>
            <div class="card" style="grid-column: 1 / -1;"><div class="label">Employee Comment</div><div class="value">${incident.employeeComment || 'No comment yet.'}</div></div>
          </div>
          <div class="footer">Generated from CenturyPly Internal Enterprise Portal • ${new Date().toLocaleString()}</div>
        </body>
      </html>`;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-4 sm:px-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-blue-600">{incident.incidentNumber}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">{incident.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
              <button type="button" onClick={handleExportPdf} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Export PDF
              </button>
            )}
            <button type="button" onClick={() => window.print()} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Printer size={16} />
            </button>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Department</div>
              <div className="mt-2"><DepartmentBadge department={incident.department} /></div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Priority</div>
              <div className="mt-2"><PriorityBadge priority={incident.priority} /></div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Status</div>
              <div className="mt-2"><StatusBadge status={incident.status} /></div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Assigned Employee</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{incident.assignedTo || 'Unassigned'}</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900">Description</div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{incident.description}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900">Timeline</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Created</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{formatDate(incident.createdAt)}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Updated</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{formatDate(incident.updatedAt)}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Current Status</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{incident.status}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Assigned Employee</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{incident.assignedTo || 'Unassigned'}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Created By</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{incident.createdBy || '—'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Employee Comment</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{incident.employeeComment || 'No comment yet.'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Closed By</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{incident.closedBy || '—'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Closed Date</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{incident.closedAt ? formatDate(incident.closedAt) : '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
