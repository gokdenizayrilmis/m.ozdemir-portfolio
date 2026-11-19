'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, m } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface AdminToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const AdminToastContext = createContext<AdminToastContextValue>({
  showToast: () => {},
});

const TOAST_DURATION_MS = 5000;

export function useAdminToast() {
  return useContext(AdminToastContext);
}

export function AdminToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismissToast = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);

      const timer = setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Top-Right Toast Stack */}
      <div
        aria-live="polite"
        className="fixed top-16 right-5 z-[100] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';

            return (
              <m.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md p-4 pr-10 flex items-start gap-3 text-xs ${
                  isSuccess
                    ? 'bg-white/95 border-emerald-200 text-slate-800'
                    : isError
                      ? 'bg-white/95 border-rose-200 text-slate-800'
                      : 'bg-white/95 border-slate-200 text-slate-800'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-50 text-emerald-600'
                      : isError
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isError ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 pt-0.5">
                  <p className="font-semibold text-slate-900 leading-snug">
                    {toast.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Bildirimi Kapat"
                  className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* 5-second countdown progress bar */}
                <m.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{
                    duration: TOAST_DURATION_MS / 1000,
                    ease: 'linear',
                  }}
                  style={{ transformOrigin: 'left' }}
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    isSuccess
                      ? 'bg-emerald-500'
                      : isError
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                  }`}
                />
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>
    </AdminToastContext.Provider>
  );
}
