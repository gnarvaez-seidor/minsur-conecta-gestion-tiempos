"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiX } from "react-icons/fi";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600",
    btn: "bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md shadow-rose-500/25 hover:shadow-lg",
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600",
    btn: "bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/25 hover:shadow-lg",
  },
  default: {
    iconBg: "",
    iconColor: "",
    btn: "bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg",
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;
  const styles = variantStyles[variant];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="relative bg-[var(--card)] rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 ring-1 ring-[var(--card-border)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 text-[var(--muted)] hover:text-[var(--foreground)] row-hover rounded-lg"
        >
          <FiX style={{ width: 18, height: 18 }} />
        </button>
        <div className="flex flex-col items-center text-center">
          {variant !== "default" && (
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
              <FiAlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
          )}
          <h3 id="confirm-dialog-title" className="text-lg font-semibold text-[var(--foreground)] leading-snug">
            {title}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed max-w-[280px]">{message}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-center gap-2.5">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium rounded-xl border border-[var(--card-border)] text-[var(--foreground)] bg-[var(--card)] row-hover"
          >
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`px-5 py-2.5 text-sm font-medium rounded-xl ${styles.btn}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
