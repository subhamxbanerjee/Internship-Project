import { Eye } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';
import {
  AuthUser,
  DocumentItem,
  deleteDocument,
  downloadDocument,
  fetchCurrentUser,
  fetchDocuments,
  formatFileType,
  formatRelativeTime,
  getApiErrorMessage,
} from '../services/api';
import PreviewModal from '../components/PreviewModal';

function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);   // ✅ added
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

useEffect(() => {
  Promise.all([
    fetchDocuments(),
    fetchCurrentUser(),
  ])
    .then(([docs, user]) => {
      setDocuments(docs);
      setCurrentUser(user);
    })
    .catch(() => {
      setError('Could not load documents. Please refresh the page.');
    })
    .finally(() => setLoading(false));
}, []);

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
        const docType = formatFileType(doc.fileType);
        const matchesFilter = filter === 'All' || docType === filter;
        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
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

  // ✅ added delete handler
  const handleDelete = async (doc: DocumentItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.title}"?`
    );
    if (!confirmed) return;

    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
    } catch (err) {
      setDownloadError(
        getApiErrorMessage(err, "Unable to delete document.")
      );
    } finally {
      setDeletingId(null);
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
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 sm:col-span-2 md:col-span-3"
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex items-center gap-2 rounded-2xl border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
                  >
                    <Eye size={18} />
                    Preview
                  </button>

                  {/* ✅ Delete button added */}
                {currentUser?.role !== "EMPLOYEE" && (
  <button
    onClick={() => handleDelete(doc)}
    disabled={deletingId === doc.id}
    className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
  >
    {deletingId === doc.id ? "Deleting..." : "Delete"}
  </button>
)}

                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDeleted={(id) =>
          setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        }
      />
    </div>
  );
}

export default DocumentsPage;