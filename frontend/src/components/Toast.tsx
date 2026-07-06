import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed right-4 top-4 z-[60] flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
}
