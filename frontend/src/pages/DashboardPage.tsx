import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Files, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DocumentItem,
  DocumentSummary,
  fetchDocumentSummary,
  fetchRecentDocuments,
  formatFullDateTime,
} from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchDocumentSummary(), fetchRecentDocuments()])
      .then(([summaryData, recentData]) => {
        setSummary(summaryData);
        setRecentDocs(recentData);
      })
      .catch(() => {
        setError('Could not load dashboard data. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading dashboard...</div>;
  }

  const stats = [
    {
      label: 'Total Documents',
      value: summary.total,
      icon: Files,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      label: 'PDF Files',
      value: summary.pdfCount,
      icon: FileText,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      label: 'Excel Sheets',
      value: summary.excelCount,
      icon: FileSpreadsheet,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Word Docs',
      value: summary.wordCount,
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'PowerPoint',
      value: summary.powerPointCount,
      icon: Presentation,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {user?.fullName || user?.username}. Here is your operational overview for the CenturyPly Internal Portal.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
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
          <h2 className="text-lg font-semibold text-slate-900">Recently Uploaded</h2>
          <Link to="/documents" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="mt-4 space-y-4">
          {recentDocs.length === 0 ? (
            <p className="text-sm text-slate-500">No documents uploaded yet.</p>
          ) : (
            recentDocs.map((doc) => (
              <div key={doc.id} className="rounded-3xl border border-slate-200 p-4">
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