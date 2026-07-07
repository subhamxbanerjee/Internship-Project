import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadDocument } from '../services/api';

function UploadPage() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Upload</h1>
        <p className="mt-4 text-slate-500">Only admins can upload documents.</p>
      </div>
    );
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds the 50MB limit.`);
        }
        await uploadDocument(file);
      }
      setMessage(`${files.length} file(s) uploaded successfully.`);
      setTimeout(() => navigate('/documents'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Upload Documents</h1>
        <p className="mt-2 text-sm text-slate-500">Drag and drop files or browse to upload company documents.</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-6 rounded-3xl border border-dashed p-12 text-center transition-colors ${
            dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <svg
  className="mx-auto h-16 w-16 animate-bounce text-sky-500"
  viewBox="0 0 24 24"
  fill="currentColor"
>
  <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4a7.49 7.49 0 0 0-7.35 6.04A5.5 5.5 0 0 0 6 20h13a4.5 4.5 0 0 0 .35-9.96zM13 13v3.5a1 1 0 0 1-2 0V13H9.41a.5.5 0 0 1-.35-.85l2.59-2.59a.5.5 0 0 1 .7 0l2.59 2.59a.5.5 0 0 1-.35.85H13z" />
</svg>
          <div className="mt-4 text-lg font-semibold text-slate-900">Drag & drop files here</div>
          <div className="mt-2 text-slate-500">Or browse files from your computer.</div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-white disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Browse Files'}
          </button>
        </div>
        {message && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Supported Types</div>
            <div className="mt-4 grid gap-2">
              {['Excel', 'PPT', 'PDF', 'Word', 'Images'].map((type) => (
                <div key={type} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">{type}</div>
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-500">Maximum file size: 50MB per document.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-red-50 p-4">
            <div className="text-sm font-semibold text-red-700">Internal Security</div>
            <div className="mt-3 text-sm text-red-700">All uploaded files are stored securely on the company server.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
