"use client";

import { useState, type FormEvent } from "react";
import { createSupplier } from "./api";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  COUNTRIES,
  COUNTRY_CURRENCY,
  STATUS_LABELS,
  type Category,
  type Country,
  type Status,
  type SupplierCreate,
} from "./types";

type SupplierFormProps = {
  onCreated: () => void;
};

type FormErrors = {
  name?: string;
  categories?: string;
  rate_per_unit?: string;
};

const inputClass =
  "rounded border border-brand-beige bg-white px-3 py-2 text-sm text-brand-charcoal";

const initialForm = {
  name: "",
  country: "Colombia" as Country,
  categories: [] as Category[],
  rate_per_unit: "",
  status: "active" as Status,
  contact_email: "",
  notes: "",
};

export default function SupplierForm({ onCreated }: SupplierFormProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setForm({ ...initialForm });
    setErrors({});
  }

  function toggleCategory(category: Category) {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
    setErrors((current) => ({ ...current, categories: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSuccess("");

    const nextErrors: FormErrors = {};
    const rate = Number(form.rate_per_unit);
    if (!form.name.trim()) nextErrors.name = "Ingresa el nombre del proveedor.";
    if (form.categories.length === 0) {
      nextErrors.categories = "Selecciona al menos una categoría.";
    }
    if (!form.rate_per_unit || !Number.isFinite(rate) || rate <= 0) {
      nextErrors.rate_per_unit = "La tarifa debe ser mayor que 0.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const data: SupplierCreate = {
      name: form.name.trim(),
      country: form.country,
      categories: form.categories,
      rate_per_unit: rate,
      currency: COUNTRY_CURRENCY[form.country],
      status: form.status,
      contact_email: form.contact_email.trim() || null,
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    try {
      await createSupplier(data);
      resetForm();
      setSuccess("Proveedor registrado correctamente.");
      onCreated();
    } catch (cause) {
      setSubmitError(
        cause instanceof Error
          ? cause.message
          : "No se pudo registrar el proveedor.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      className="mb-6 rounded-md border border-brand-beige bg-white p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-brand-warmgray">
          Nombre
          <input
            type="text"
            value={form.name}
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            onChange={(event) => {
              setForm((current) => ({ ...current, name: event.target.value }));
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            className={inputClass}
          />
          {errors.name && <span className="text-sm text-red-600">{errors.name}</span>}
        </label>

        <div className="flex flex-col gap-1 text-sm text-brand-warmgray">
          <label htmlFor="supplier-country">País</label>
          <select
            id="supplier-country"
            value={form.country}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                country: event.target.value as Country,
              }))
            }
            className={inputClass}
          >
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country === "USA" ? "Estados Unidos" : country}
              </option>
            ))}
          </select>
          <p className="text-sm text-brand-warmgray">
            Moneda: {COUNTRY_CURRENCY[form.country]}
          </p>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm text-brand-warmgray">Categorías</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 text-sm text-brand-charcoal"
              >
                <input
                  type="checkbox"
                  checked={form.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="accent-brand-ochre"
                />
                {CATEGORY_LABELS[category]}
              </label>
            ))}
          </div>
          {errors.categories && (
            <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
          )}
        </fieldset>

        <label className="flex flex-col gap-1 text-sm text-brand-warmgray">
          Tarifa por unidad
          <input
            type="number"
            min="0"
            step="any"
            value={form.rate_per_unit}
            aria-required="true"
            aria-invalid={Boolean(errors.rate_per_unit)}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                rate_per_unit: event.target.value,
              }));
              setErrors((current) => ({ ...current, rate_per_unit: undefined }));
            }}
            className={inputClass}
          />
          {errors.rate_per_unit && (
            <span className="text-sm text-red-600">{errors.rate_per_unit}</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm text-brand-warmgray">
          Estado
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as Status,
              }))
            }
            className={inputClass}
          >
            <option value="active">{STATUS_LABELS.active}</option>
            <option value="suspended">{STATUS_LABELS.suspended}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-brand-warmgray">
          Email de contacto
          <input
            type="email"
            value={form.contact_email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                contact_email: event.target.value,
              }))
            }
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-brand-warmgray sm:col-span-2">
          Notas
          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
            rows={3}
            className={inputClass}
          />
        </label>
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {submitError}
        </p>
      )}
      {success && (
        <p role="status" className="mt-4 text-sm text-green-700">
          {success}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="mt-5 min-h-11 rounded bg-brand-ochre px-4 py-2 text-sm text-brand-darkbrown hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar proveedor"}
      </button>
    </form>
  );
}
