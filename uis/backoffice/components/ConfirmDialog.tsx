"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  loadingLabel = "Eliminando…",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Enfoca "Cancelar" al abrir y devuelve el foco al cerrar.
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previousFocus?.focus();
  }, [open]);

  // Escape cierra el diálogo, salvo mientras se procesa la acción.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="w-full max-w-md rounded-[20px] border border-bo-border bg-bo-surface p-6 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold text-bo-text">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-bo-muted">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-11 rounded-full border border-bo-border bg-bo-surface px-5 text-sm text-bo-text hover:bg-bo-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="min-h-11 rounded-full bg-bo-danger px-5 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-danger disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
