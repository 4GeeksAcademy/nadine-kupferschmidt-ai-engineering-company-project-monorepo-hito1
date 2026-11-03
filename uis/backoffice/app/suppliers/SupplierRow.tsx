"use client";

import { useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteSupplier, updateRate, updateStatus } from "./api";
import { CATEGORY_LABELS, STATUS_LABELS, type Supplier } from "./types";

type SupplierRowProps = {
  supplier: Supplier;
  onUpdated: (supplier: Supplier) => void;
  onDeleted: (id: number) => void;
};

type RowAction = "rate" | "status" | "delete";

const secondaryButtonClass =
  "rounded border border-brand-beige bg-white px-3 py-1.5 text-sm text-brand-darkbrown hover:border-brand-ochre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass =
  "rounded bg-brand-ochre px-3 py-1.5 text-sm text-brand-darkbrown hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50";

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

  return (
    <>
      <tr className="hover:bg-brand-ivory">
        <td className="px-4 py-3 font-medium text-brand-darkbrown">
          {supplier.name}
        </td>
        <td className="px-4 py-3 text-brand-charcoal">
          {supplier.country === "USA" ? "Estados Unidos" : supplier.country}
        </td>
        <td className="px-4 py-3 text-brand-charcoal">
          {supplier.categories
            .map((category) => CATEGORY_LABELS[category])
            .join(", ")}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-brand-charcoal">
          {editingRate ? (
            <div className="flex min-w-48 flex-col gap-2">
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
                className="w-full rounded border border-brand-beige bg-white px-3 py-2 text-sm text-brand-charcoal"
              />
              <p className="text-xs text-brand-warmgray whitespace-normal">
                Usa punto solo para decimales y no escribas separador de miles. Ej.: 28500 o 6.80
              </p>
              {rateError && <p className="text-sm text-red-600">{rateError}</p>}
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
                <span className="text-sm text-brand-warmgray">Guardando…</span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <span>{formatRate(supplier)}</span>
              <button
                type="button"
                disabled={saving}
                onClick={startEditingRate}
                aria-label={`Editar tarifa de ${supplier.name}`}
                className="text-xs text-brand-warmgray underline hover:text-brand-ochre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50"
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
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isActive ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`text-sm ${isActive ? "text-green-700" : "text-red-700"}`}>
              {STATUS_LABELS[supplier.status]}
            </span>
            {savingAction === "status" && (
              <span className="text-sm text-brand-warmgray">Guardando…</span>
            )}
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-brand-warmgray">
          {dateFormatter.format(new Date(supplier.updated_at))}
        </td>
        <td className="w-12 px-2 py-3 text-center">
          {savingAction === "delete" ? (
            <span className="text-sm text-brand-warmgray">Guardando…</span>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setError("");
                setConfirmOpen(true);
              }}
              aria-label={`Eliminar ${supplier.name}`}
              className="rounded p-1 text-brand-warmgray hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50"
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
        <tr>
          <td colSpan={7} className="px-4 pb-3 text-sm text-red-600">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}
