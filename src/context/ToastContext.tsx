import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { id, message, type };

    setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 toasts

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Accessible Toast Container with aria-live */}
      <aside 
        aria-label="Notifications" 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3"
      >
        <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-2 w-full">
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isWarning = toast.type === 'warning';
            const isError = toast.type === 'error';

            return (
              <div
                key={toast.id}
                role="status"
                className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-medium transition-all transform translate-y-0 opacity-100 ${
                  isSuccess
                    ? 'bg-slate-900 text-white border-emerald-500/40 shadow-emerald-950/20'
                    : isWarning
                    ? 'bg-amber-950 text-white border-amber-500/40 shadow-amber-950/20'
                    : isError
                    ? 'bg-rose-950 text-white border-rose-500/40 shadow-rose-950/20'
                    : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />}
                  {isError && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />}
                  {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />}
                  <span className="truncate">{toast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors shrink-0 cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
    };
  }
  return context;
}
