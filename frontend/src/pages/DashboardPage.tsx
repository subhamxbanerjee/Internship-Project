import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchDashboardStatus,
  getDashboardPdfUrl
} from '../services/api';

function DashboardPage() {
  const { user } = useAuth();
  const [pdfVersion, setPdfVersion] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const firstLoad = useRef(true);

  const loadDashboard = useCallback(async () => {

    if (firstLoad.current) {
      setLoading(true);
    }

    setError('');

    try {

      const data = await fetchDashboardStatus();

      if (!data.exists) {
        throw new Error();
      }

      setPdfVersion(current =>
        current !== data.version ? data.version : current
      );

      setLastUpdated(new Date(data.lastUpdated));

    } catch {

      setError(
        'Dashboard PDF not found.\n\nExport the Excel dashboard to:\n\nD:\\DASHBOARD\\output\\dashboard.pdf'
      );

    } finally {

      setLoading(false);

      firstLoad.current = false;

    }

  }, []);

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => clearInterval(interval);

  }, [loadDashboard]);

  const pdfUrl = getDashboardPdfUrl(pdfVersion);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-red-600">
    🚀 NEW PDF DASHBOARD
</h1>            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {user?.fullName || user?.username}.
              {lastUpdated && (
                <span className="ml-1 text-slate-400">
                  Last updated {lastUpdated.toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-4 whitespace-pre-line rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="flex h-[calc(100vh-180px)] items-center justify-center">
              <RefreshCw size={30} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <iframe
              key={pdfVersion}
              src={pdfUrl}
              title="IT Asset Dashboard"
              className="h-[calc(100vh-180px)] w-full rounded-2xl border"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;