import { useEffect, useMemo, useState } from 'react';
import {
  DocumentItem,
  downloadDocument,
  fetchDocuments,
  formatFileType,
  formatRelativeTime,
  getApiErrorMessage,
} from '../services/api';

function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    fetchDocuments()
      .then(setDocuments)
      .catch(() => {
        setError('Could not load documents. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
      const docType = formatFileType(doc.fileType);
      const matchesFilter = filter === 'All' || docType === filter;
      return matchesSearch && matchesFilter;
    });
  }, [documents, search, filter]);

  const handleDownload = async (doc: DocumentItem) => {
    setDownloadingId(doc.id);
    setDownloadError('');
    try {
      await downloadDocument(doc.id, doc.title);
    } catch (err) {
      setDownloadError(getApiErrorMessage(err, `Could not download "${doc.title}".`));
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {downloadError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{downloadError}</div>}
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
            <p className="mt-2 text-sm text-slate-500">Search, filter, and download uploaded company documents.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            >
              <option>All</option>
              <option>PDF</option>
              <option>Excel</option>
              <option>Word</option>
              <option>PowerPoint</option>
              <option>Images</option>
            </select>
          </div>
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        {filteredDocuments.length === 0 ? (
          <p className="text-sm text-slate-500">No documents found.</p>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex flex-col gap-2 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{doc.title}</div>
                  <div className="text-sm text-slate-500">
                    {formatFileType(doc.fileType)} · {doc.uploadedBy} · {formatRelativeTime(doc.uploadedAt)}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
