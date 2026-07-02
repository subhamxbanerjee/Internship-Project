import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { DocumentItem, formatFileType } from "../services/api";

interface PreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function PreviewModal({
  document,
  onClose,
}: PreviewModalProps) {
  const [loading, setLoading] = useState(true);

  // Reset loading whenever a new document opens
  useEffect(() => {
    setLoading(true);
  }, [document]);

  // Close using ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!document) return null;

  const previewUrl = `${API_BASE}/documents/preview/${document.id}`;
  const type = document.fileType.toLowerCase();

  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(type);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scaleIn flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {document.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatFileType(document.fileType)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="relative flex-1 bg-slate-100 p-4">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm text-slate-500">
                  Loading preview...
                </p>
              </div>
            </div>
          )}

          {type === "pdf" ? (
            <iframe
              src={previewUrl}
              title={document.title}
              className="h-full w-full rounded-2xl border bg-white"
              onLoad={() => setLoading(false)}
            />
          ) : isImage ? (
            <img
              src={previewUrl}
              alt={document.title}
              className="mx-auto h-full max-h-full rounded-2xl object-contain"
              onLoad={() => setLoading(false)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <h3 className="text-lg font-semibold text-slate-700">
                  Preview unavailable
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  This file type cannot be previewed in the browser.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}