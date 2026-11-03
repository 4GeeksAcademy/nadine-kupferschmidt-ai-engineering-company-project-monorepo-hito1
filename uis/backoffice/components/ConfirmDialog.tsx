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
        className="w-full max-w-md rounded-md border border-brand-beige bg-white p-6 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold text-brand-darkbrown">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-brand-charcoal">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded border border-brand-beige bg-white px-4 py-2 text-sm text-brand-darkbrown hover:border-brand-ochre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
