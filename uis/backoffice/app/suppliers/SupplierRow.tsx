"use client";

import { useState } from "react";
import { deleteSupplier, updateRate, updateStatus } from "./api";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type Status,
  type Supplier,
} from "./types";

type SupplierRowProps = {
  supplier: Supplier;
  onUpdated: (supplier: Supplier) => void;
  onDeleted: (id: number) => void;
};

const statusClass: Record<Status, string> = {
  active: "border-green-600 text-green-700",
  suspended: "border-red-600 text-red-700",
};

const secondaryButtonClass =
  "rounded border border-brand-beige bg-white px-3 py-1.5 text-sm text-brand-darkbrown hover:border-brand-ochre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass =
  "rounded bg-brand-ochre px-3 py-1.5 text-sm text-brand-darkbrown hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatRate(supplier: Supplier): string {
  const decimals = supplier.currency === "COP" ? 0 : 2;
  const amount = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(supplier.rate_per_unit);

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
  const [saving, setSaving] = useState(false);

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

    setSaving(true);
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
      setSaving(false);
    }
  }

  async function toggleStatus() {
    const nextStatus = supplier.status === "active" ? "suspended" : "active";
    setSaving(true);
    setError("");
    try {
      const updatedSupplier = await updateStatus(supplier.id, nextStatus);
      onUpdated(updatedSupplier);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo actualizar el estado.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeSupplier() {
    const confirmed = window.confirm(
      "¿Eliminar este proveedor? Solo debe usarse para corregir datos cargados por error.",
    );
    if (!confirmed) return;

    setSaving(true);
    setError("");
    try {
      await deleteSupplier(supplier.id);
      onDeleted(supplier.id);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo eliminar el proveedor.",
      );
    } finally {
      setSaving(false);
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
            </div>
          ) : (
            formatRate(supplier)
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block rounded-full border px-2 py-0 text-xs font-medium ${statusClass[supplier.status]}`}
          >
            {STATUS_LABELS[supplier.status]}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-brand-warmgray">
          {dateFormatter.format(new Date(supplier.updated_at))}
        </td>
        <td className="px-4 py-3">
          <div className="flex min-w-32 flex-col items-start gap-2">
            {saving && (
              <span className="text-sm text-brand-warmgray">Guardando…</span>
            )}
            {!editingRate && (
              <button
                type="button"
                disabled={saving}
                onClick={startEditingRate}
                className={secondaryButtonClass}
              >
                Editar tarifa
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={toggleStatus}
              className={
                supplier.status === "active"
                  ? secondaryButtonClass
                  : primaryButtonClass
              }
            >
              {supplier.status === "active" ? "Suspender" : "Activar"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={removeSupplier}
              className="text-xs text-red-600 underline hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
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
