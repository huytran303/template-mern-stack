import { useCallback, useRef, useState } from "react";

import { cn } from "@/utils/cn";

export type ToastVariant = "success" | "danger" | "warning";

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "bg-success-bg-app text-success-text-app",
  danger: "bg-danger-bg-app text-danger-text-app",
  warning: "bg-warning-bg-app text-warning-text-app",
};

interface AppToastProps {
  message: string;
  variant?: ToastVariant;
  closeLabel: string;
  onClose: () => void;
  className?: string;
}

export function AppToast({ message, variant = "success", closeLabel, onClose, className }: AppToastProps) {
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded border border-current/25 px-3 py-2 shadow-lg",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <span className="grow text-sm">{message}</span>
      <button aria-label={closeLabel} onClick={onClose} className="font-bold">
        ×
      </button>
    </div>
  );
}

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const AUTO_DISMISS_MS = 4000;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return { toasts, show, dismiss };
}

interface AppToastViewportProps {
  toasts: ToastItem[];
  closeLabel: string;
  onDismiss: (id: number) => void;
}

export function AppToastViewport({ toasts, closeLabel, onDismiss }: AppToastViewportProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-96">
      {toasts.map((toast) => (
        <AppToast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          closeLabel={closeLabel}
          onClose={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}
