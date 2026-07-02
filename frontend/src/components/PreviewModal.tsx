import { useEffect, useState } from "react";
import { X } from "lucide-react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import {
  DocumentItem,
  formatFileType,
  fetchDocumentPreviewBlob,
} from "../services/api";

interface PreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const OFFICE_TYPES = ["docx"];
const SHEET_TYPES = ["xlsx", "xls", "csv"];

export default function PreviewModal({
  document,
  onClose,
}: PreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // docx
  const [docHtml, setDocHtml] = useState<string | null>(null);

  // xlsx
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");

  const type = document?.fileType.toLowerCase() ?? "";
  const previewUrl = document
    ? `${API_BASE}/documents/preview/${document.id}`
    : "";

  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(type);
  const isPdf = type === "pdf";
  const isDocx = OFFICE_TYPES.includes(type);
  const isSheet = SHEET_TYPES.includes(type);

  // Reset state whenever a new document opens
  useEffect(() => {
    setError(null);
    setDocHtml(null);
    setWorkbook(null);
    setSheetNames([]);
    setActiveSheet("");

    if (!document) return;

    // pdf/image loading is handled by onLoad below
    if (isPdf || isImage) {
      setLoading(true);
      return;
    }

    if (!isDocx && !isSheet) {
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

  // Close using ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!document) return null;

  const activeSheetHtml =
    workbook && activeSheet
      ? XLSX.utils.sheet_to_html(workbook.Sheets[activeSheet], {
          id: "sheet-table",
        })
      : "";

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
                dangerouslySetInnerHTML={{ __html: docHtml }}
              />
            </div>
          ) : isSheet && activeSheetHtml ? (
            <div className="rounded-2xl bg-white p-4 shadow">
              <div
                className="sheet-preview overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: activeSheetHtml }}
              />
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