import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock3, Files, FileText, FileSpreadsheet, Presentation, Sparkles, TimerReset } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DocumentItem,
  DocumentSummary,
  fetchDocumentSummary,
  fetchRecentDocuments,
  formatFullDateTime,
} from '../services/api';
import { fetchIncidents } from '../services/incidentApi';
import type { Incident } from '../types/incident';

function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DocumentSummary>({
    total: 0,
    pdfCount: 0,
    excelCount: 0,
    wordCount: 0,
    powerPointCount: 0,
  });
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryData, recentData, incidentData] = await Promise.all([
          fetchDocumentSummary(),
          fetchRecentDocuments(),
          fetchIncidents(),
        ]);
        setSummary(summaryData);
        setRecentDocs(recentData);
        setIncidents(incidentData);
      } catch {
        setError('Could not load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    const handleRefresh = () => {
      void loadDashboard();
    };

    window.addEventListener('incidents:updated', handleRefresh);
    return () => window.removeEventListener('incidents:updated', handleRefresh);
  }, []);

  const incidentStats = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const closedToday = incidents.filter((incident) => incident.status === 'CLOSED' && incident.closedAt && new Date(incident.closedAt).getTime() >= startOfDay.getTime()).length;
    return {
      total: incidents.length,
      open: incidents.filter((incident) => incident.status === 'OPEN').length,
      inProgress: incidents.filter((incident) => incident.status === 'IN_PROGRESS').length,
      pendingReview: incidents.filter((incident) => incident.status === 'PENDING_REVIEW').length,
      closedToday,
      highPriority: incidents.filter((incident) => incident.priority === 'HIGH').length,
    };
  }, [incidents]);

  const documentStats = [
    { label: 'Total Documents', value: summary.total, icon: Files, iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
    { label: 'PDF Files', value: summary.pdfCount, icon: FileText, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
    { label: 'Excel Sheets', value: summary.excelCount, icon: FileSpreadsheet, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Word Docs', value: summary.wordCount, icon: FileText, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'PowerPoint', value: summary.powerPointCount, icon: Presentation, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  ];

  const incidentCards = [
    { label: 'Total Incidents', value: incidentStats.total, icon: Sparkles, iconBg: 'bg-blue-100', iconColor: 'text-blue-700' },
    { label: 'Open Incidents', value: incidentStats.open, icon: AlertTriangle, iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
    { label: 'In Progress', value: incidentStats.inProgress, icon: Clock3, iconBg: 'bg-orange-100', iconColor: 'text-orange-700' },
    { label: 'Pending Review', value: incidentStats.pendingReview, icon: TimerReset, iconBg: 'bg-violet-100', iconColor: 'text-violet-700' },
    { label: 'Closed Today', value: incidentStats.closedToday, icon: CheckCircle2, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700' },
    { label: 'High Priority', value: incidentStats.highPriority, icon: AlertTriangle, iconBg: 'bg-rose-100', iconColor: 'text-rose-700' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {user?.fullName || user?.username}. Here is your operational overview for the CenturyPly Internal Portal.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {documentStats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
              <div key={label} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <div>
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-0.5 text-2xl font-semibold text-slate-900">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Incident Health</h2>
          <Link to="/incidents" className="text-sm font-medium text-blue-600 hover:underline">View all incidents</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {incidentCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                  <Icon size={20} className={iconColor} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recently Uploaded</h2>
          <Link to="/documents" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="mt-4 space-y-4">
          {recentDocs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No documents uploaded yet.
            </div>
          ) : (
            recentDocs.map((doc) => (
              <div key={doc.id} className="rounded-3xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                <div className="font-medium text-slate-900">{doc.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  Uploaded by {doc.uploadedBy} · {formatFullDateTime(doc.uploadedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;