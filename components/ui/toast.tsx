"use client";

import React, { createContext, useContext, useEffect,useMemo, useState } from "react";
import { createPortal } from "react-dom";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: string;
  kind: ToastKind;
  title?: string;
  description?: string;
};

type ToastContextValue = {
  toast: (kind: ToastKind, title?: string, description?: string) => void;
  success: (title?: string, description?: string) => void;
  error: (title?: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const toast = (kind: ToastKind, title?: string, description?: string) => {
    const id = crypto.randomUUID();
    const item: ToastItem = { id, kind, title, description };
    setToasts((s) => [item, ...s]);
    setTimeout(() => {
      setToasts((s) => s.filter((t) => t.id !== id));
    }, 4000);
  };

  const value = useMemo(
    () => ({ toast, success: (t?: string, d?: string) => toast("success", t, d), error: (t?: string, d?: string) => toast("error", t, d) }),
    []
  );

  useEffect(() => setMounted(true), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-3">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-opacity bg-opacity-95 flex flex-col gap-1 ${{
                success: "bg-emerald-600 text-white",
                error: "bg-red-600 text-white",
                info: "bg-slate-700 text-white",
              }[t.kind]}`}
            >
              {t.title && <div className="font-semibold">{t.title}</div>}
              {t.description && <div className="text-sm opacity-90">{t.description}</div>}
            </div>
          ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
