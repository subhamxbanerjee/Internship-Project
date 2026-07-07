import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import {
  DocumentItem,
  formatFileType,
  fetchDocumentPreviewBlob,
  deleteDocument,
} from "../services/api";
import { parsePptxSlides } from "../utils/pptxParser";
import { useAuth } from "../context/AuthContext";

interface PreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDeleted?: (id: number) => void;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const OFFICE_TYPES = ["docx"];
const SHEET_TYPES = ["xlsx", "xls", "csv"];
const PPT_TYPES = ["pptx"];

function sanitizeHtmlFragment(value: string): string {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
}

export default function PreviewModal({
  document,
  onClose,
  onDeleted,
}: PreviewModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // docx
  const [docHtml, setDocHtml] = useState<string | null>(null);

  // xlsx
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");

  // pptx
  const [slides, setSlides] = useState<string[][]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  // delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const type = document?.fileType.toLowerCase() ?? "";
  const previewUrl = document
    ? `${API_BASE}/documents/preview/${document.id}`
    : "";

  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(type);
  const isPdf = type === "pdf";
  const isDocx = OFFICE_TYPES.includes(type);
  const isSheet = SHEET_TYPES.includes(type);
  const isPpt = PPT_TYPES.includes(type);

  const canDelete = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  // Reset state whenever a new document opens
  useEffect(() => {
    setError(null);
    setDocHtml(null);
    setWorkbook(null);
    setSheetNames([]);
    setActiveSheet("");
    setSlides([]);
    setActiveSlide(0);
    setConfirmDelete(false);
    setDeleteError("");

    if (!document) return;

    // pdf/image loading is handled by onLoad below
    if (isPdf || isImage) {
      setLoading(true);
      return;
    }

    if (!isDocx && !isSheet && !isPpt) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const blob = await fetchDocumentPreviewBlob(
          document.id,
          controller.signal
        );
        const buffer = await blob.arrayBuffer();

        if (isDocx) {
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          setDocHtml(result.value);
        } else if (isSheet) {
          const wb = XLSX.read(buffer, { type: "array" });
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          setActiveSheet(wb.SheetNames[0] ?? "");
        } else if (isPpt) {
          const parsedSlides = await parsePptxSlides(buffer);
          setSlides(parsedSlides);
          setActiveSlide(0);
        }
      } catch (err) {
        const name = (err as Error).name;
        if (name !== "CanceledError" && name !== "AbortError") {
          setError("Couldn't load a preview for this file.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  // Close using ESC key, navigate slides with arrows
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (isPpt && slides.length > 0) {
        if (event.key === "ArrowRight") {
          setActiveSlide((i) => Math.min(i + 1, slides.length - 1));
        }
        if (event.key === "ArrowLeft") {
          setActiveSlide((i) => Math.max(i - 1, 0));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isPpt, slides.length]);

  if (!document) return null;

  const activeSheetHtml =
    workbook && activeSheet
      ? sanitizeHtmlFragment(
          XLSX.utils.sheet_to_html(workbook.Sheets[activeSheet], {
            id: "sheet-table",
          })
        )
      : "";

  const handleDelete = async () => {
    if (!document) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteDocument(document.id);
      onDeleted?.(document.id);
      onClose();
    } catch (err) {
      setDeleteError("Could not delete this file. Please try again.");
      setDeleting(false);
    }
  };

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
          <div className="flex items-center gap-3">
            {canDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                title="Delete document"
                className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={20} />
              </button>
            )}

            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {document.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatFileType(document.fileType)}
                {isPpt && slides.length > 0 && (
                  <span className="ml-2 text-slate-400">
                    · Slide {activeSlide + 1} of {slides.length}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Delete confirmation banner */}
        {confirmDelete && (
          <div className="flex items-center justify-between gap-4 border-b bg-red-50 px-6 py-3">
            <p className="text-sm text-red-700">
              {deleteError ||
                `Delete "${document.title}" permanently? This cannot be undone.`}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Sheet tabs (xlsx only) */}
        {isSheet && sheetNames.length > 1 && (
          <div className="flex gap-1 overflow-x-auto border-b bg-slate-50 px-4 py-2">
            {sheetNames.map((name) => (
              <button
                key={name}
                onClick={() => setActiveSheet(name)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  activeSheet === name
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Preview Area */}
        <div className="relative flex-1 overflow-auto bg-slate-100 p-4">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm text-slate-500">Loading preview...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                <h3 className="text-lg font-semibold text-slate-700">
                  Preview failed
                </h3>
                <p className="mt-2 text-sm text-slate-500">{error}</p>
              </div>
            </div>
          ) : isPdf ? (
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
          ) : isDocx && docHtml ? (
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 shadow">
              <div
                className="docx-preview prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtmlFragment(docHtml) }}
              />
            </div>
          ) : isSheet && activeSheetHtml ? (
            <div className="rounded-2xl bg-white p-4 shadow">
              <div
                className="sheet-preview overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: activeSheetHtml }}
              />
            </div>
          ) : isPpt && slides.length > 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex aspect-video w-full max-w-3xl flex-col justify-center rounded-2xl bg-white p-12 shadow">
                {slides[activeSlide]?.length > 0 ? (
                  <>
                    <h3 className="mb-4 text-2xl font-bold text-slate-900">
                      {slides[activeSlide][0]}
                    </h3>
                    <ul className="space-y-2">
                      {slides[activeSlide].slice(1).map((line, i) => (
                        <li key={i} className="text-slate-700">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-center text-slate-400">
                    (No text content on this slide)
                  </p>
                )}
              </div>

              {/* Slide navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveSlide((i) => Math.max(i - 1, 0))}
                  disabled={activeSlide === 0}
                  className="rounded-full bg-white p-2 shadow transition hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-2 w-2 rounded-full transition ${
                        i === activeSlide ? "bg-blue-600 w-6" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setActiveSlide((i) => Math.min(i + 1, slides.length - 1))
                  }
                  disabled={activeSlide === slides.length - 1}
                  className="rounded-full bg-white p-2 shadow transition hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : !loading ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}