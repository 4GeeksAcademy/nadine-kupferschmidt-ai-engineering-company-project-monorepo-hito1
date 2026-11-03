"use client";

import { useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteSupplier, updateRate, updateStatus } from "./api";
import { CATEGORY_LABELS, STATUS_LABELS, type Supplier } from "./types";

type SupplierRowProps = {
  supplier: Supplier;
  striped: boolean;
  onUpdated: (supplier: Supplier) => void;
  onDeleted: (id: number) => void;
};

type RowAction = "rate" | "status" | "delete";

const secondaryButtonClass =
  "min-h-11 rounded-full border border-bo-border bg-bo-surface px-4 text-sm text-bo-text hover:bg-bo-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass =
  "min-h-11 rounded-full bg-bo-accent px-4 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

// Cada moneda se muestra con el formato de su país.
const rateFormatters = {
  COP: new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

function formatRate(supplier: Supplier): string {
  const amount = rateFormatters[supplier.currency].format(supplier.rate_per_unit);
  return `${amount} ${supplier.currency}`;
}

export default function SupplierRow({
  supplier,
  striped,
  onUpdated,
  onDeleted,
}: SupplierRowProps) {
  const [editingRate, setEditingRate] = useState(false);
  const [rateValue, setRateValue] = useState(String(supplier.rate_per_unit));
  const [rateError, setRateError] = useState("");
  const [error, setError] = useState("");
  // Acción en curso; deshabilita toda la fila mientras guarda.
  const [savingAction, setSavingAction] = useState<RowAction | null>(null);
  const saving = savingAction !== null;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isActive = supplier.status === "active";

  function startEditingRate() {
    setRateValue(String(supplier.rate_per_unit));
    setRateError("");
    setError("");
    setEditingRate(true);
  }

  function cancelEditingRate() {
    setEditingRate(false);
    setRateValue(String(supplier.rate_per_unit));
    setRateError("");
  }

  async function saveRate() {
    const rate = Number(rateValue);
    if (!rateValue || !Number.isFinite(rate) || rate <= 0) {
      setRateError("La tarifa debe ser mayor que 0.");
      return;
    }

    setSavingAction("rate");
    setError("");
    setRateError("");
    try {
      const updatedSupplier = await updateRate(supplier.id, rate);
      onUpdated(updatedSupplier);
      setEditingRate(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo actualizar la tarifa.",
      );
    } finally {
      setSavingAction(null);
    }
  }

  async function toggleStatus() {
    const nextStatus = isActive ? "suspended" : "active";
    setSavingAction("status");
    setError("");
    try {
      const updatedSupplier = await updateStatus(supplier.id, nextStatus);
      onUpdated(updatedSupplier);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo actualizar el estado.",
      );
    } finally {
      setSavingAction(null);
    }
  }

  async function removeSupplier() {
    setSavingAction("delete");
    setError("");
    try {
      await deleteSupplier(supplier.id);
      onDeleted(supplier.id);
    } catch (cause) {
      // Cierra el diálogo para que el error se vea en la fila.
      setConfirmOpen(false);
      setError(
        cause instanceof Error ? cause.message : "No se pudo eliminar el proveedor.",
      );
    } finally {
      setSavingAction(null);
    }
  }

  const rowBackground = striped ? "bg-bo-stripe" : "bg-bo-surface";

  return (
    <>
      <tr className={`border-t border-bo-divider align-middle ${rowBackground}`}>
        <td className="px-4 py-3">
          <p className="font-medium text-bo-text">{supplier.name}</p>
          {supplier.contact_email && (
            <p className="text-xs text-bo-muted">{supplier.contact_email}</p>
          )}
        </td>
        <td className="px-4 py-3 text-bo-text">
          {supplier.country === "USA" ? "Estados Unidos" : supplier.country}
        </td>
        <td className="px-4 py-3">
          <ul className="flex flex-wrap gap-1.5">
            {supplier.categories.map((category) => (
              <li
                key={category}
                className="rounded-full bg-bo-chip px-2.5 py-0.5 text-xs text-bo-menu"
              >
                {CATEGORY_LABELS[category]}
              </li>
            ))}
          </ul>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right text-bo-text">
          {editingRate ? (
            <div className="ml-auto flex min-w-48 flex-col gap-2 text-left">
              <input
                type="number"
                min="0"
                step="any"
                value={rateValue}
                aria-label={`Tarifa por unidad de ${supplier.name}`}
                aria-invalid={Boolean(rateError)}
                disabled={saving}
                onChange={(event) => {
                  setRateValue(event.target.value);
                  setRateError("");
                }}
                className="min-h-11 w-full rounded-[10px] border border-bo-border bg-bo-surface px-3 text-sm tabular-nums text-bo-text"
              />
              <p className="text-xs text-bo-muted whitespace-normal">
                Usa punto solo para decimales y no escribas separador de miles. Ej.: 28500 o 6.80
              </p>
              {rateError && <p className="text-sm text-bo-danger">{rateError}</p>}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveRate}
                  className={primaryButtonClass}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelEditingRate}
                  className={secondaryButtonClass}
                >
                  Cancelar
                </button>
              </div>
              {savingAction === "rate" && (
                <span className="text-sm text-bo-muted">Guardando…</span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3">
              <span className="tabular-nums">{formatRate(supplier)}</span>
              <button
                type="button"
                disabled={saving}
                onClick={startEditingRate}
                aria-label={`Editar tarifa de ${supplier.name}`}
                className="text-xs text-bo-muted underline hover:text-bo-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                Editar
              </button>
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label={`Cambiar estado de ${supplier.name}`}
              disabled={saving}
              onClick={toggleStatus}
              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? "bg-bo-switch-on" : "bg-bo-switch-off"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-3 w-3 rounded-full bg-bo-surface shadow transition-transform ${
                  isActive ? "translate-x-3.5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`text-xs ${isActive ? "text-bo-success" : "text-bo-danger"}`}>
              {STATUS_LABELS[supplier.status]}
            </span>
            {savingAction === "status" && (
              <span className="text-sm text-bo-muted">Guardando…</span>
            )}
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-bo-muted">
          {dateFormatter.format(new Date(supplier.updated_at))}
        </td>
        <td className="w-14 px-2 py-3 text-center">
          {savingAction === "delete" ? (
            <span className="text-sm text-bo-muted">Guardando…</span>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setError("");
                setConfirmOpen(true);
              }}
              aria-label={`Eliminar ${supplier.name}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-bo-muted hover:text-bo-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
          <ConfirmDialog
            open={confirmOpen}
            title={`¿Eliminar a ${supplier.name}?`}
            message="Esta acción borra el proveedor del directorio de forma permanente y no se puede deshacer. Si el proveedor solo dejó de trabajar con Brasaland, es mejor suspenderlo."
            confirmLabel="Eliminar proveedor"
            loading={savingAction === "delete"}
            onConfirm={removeSupplier}
            onCancel={() => setConfirmOpen(false)}
          />
        </td>
      </tr>
      {error && (
        <tr className={rowBackground}>
          <td colSpan={7} className="px-4 pb-3 text-sm text-bo-danger">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}
