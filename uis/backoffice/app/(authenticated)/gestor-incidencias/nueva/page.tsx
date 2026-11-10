"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import {
  BRANCH_OPTIONS,
  CATEGORY_OPTIONS,
  ORIGIN_OPTIONS,
  STATUS_OPTIONS,
} from "../constants";
import type {
  Incident,
  IncidentApiError,
  IncidentBranch,
  IncidentCategory,
  IncidentCreate,
  IncidentOrigin,
  IncidentStatus,
} from "../types";

type FormState = {
  title: string;
  description: string;
  category: IncidentCategory | "";
  origin: IncidentOrigin | "";
  branch: IncidentBranch | "";
  status: IncidentStatus;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  title: "",
  description: "",
  category: "",
  origin: "",
  branch: "",
  status: "open",
};

const GENERAL_ERROR = "No pudimos registrar la incidencia. Inténtalo de nuevo en unos minutos.";

const fieldClass = (hasError: boolean) =>
  `min-h-12 w-full rounded-[10px] border-2 bg-bo-surface px-4 py-3 text-base text-bo-text ${
    hasError ? "border-bo-danger" : "border-bo-border"
  }`;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Escribe un título para la incidencia.";
  if (!form.category) errors.category = "Selecciona una categoría.";
  if (!form.origin) errors.origin = "Selecciona el origen.";
  if (!form.branch) errors.branch = "Selecciona la sede.";
  if (!form.description.trim()) errors.description = "Describe lo que pasó.";
  return errors;
}

export default function NuevaIncidenciaPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneralError("");
    setSuccess("");

    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    const payload: IncidentCreate = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as IncidentCategory,
      origin: form.origin as IncidentOrigin,
      branch: form.branch as IncidentBranch,
      status: form.status,
    };

    setSaving(true);
    try {
      const response = await apiFetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        const body = (await response.json()) as Partial<IncidentApiError>;
        const fieldErrors: FormErrors = {};
        for (const item of body.errors ?? []) {
          if (item.field in initialForm) {
            fieldErrors[item.field as keyof FormState] = item.message;
          }
        }
        if (Object.keys(fieldErrors).length === 0) {
          throw new Error("Respuesta de validación inesperada.");
        }
        setErrors(fieldErrors);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const created = (await response.json()) as Incident;
      setForm(initialForm);
      setErrors({});
      setSuccess(`Incidencia #${created.id} registrada correctamente.`);
    } catch {
      setGeneralError(GENERAL_ERROR);
    } finally {
      setSaving(false);
    }
  }

  const isBranchOrigin = form.origin === "branch";

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-bo-text">Registrar incidencia</h1>
        <p className="mt-1 text-base text-bo-muted">
          Describe lo ocurrido para que el equipo pueda darle seguimiento.
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="rounded-[18px] border border-bo-border bg-bo-surface p-5 sm:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="incident-title" className="text-base font-medium text-bo-text">
              Título
            </label>
            <input
              id="incident-title"
              type="text"
              value={form.title}
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              onChange={(event) => updateField("title", event.target.value)}
              className={fieldClass(Boolean(errors.title))}
            />
            {errors.title && <p className="text-base text-bo-danger">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="incident-category" className="text-base font-medium text-bo-text">
              Categoría
            </label>
            <select
              id="incident-category"
              value={form.category}
              aria-required="true"
              aria-invalid={Boolean(errors.category)}
              onChange={(event) =>
                updateField("category", event.target.value as IncidentCategory | "")
              }
              className={fieldClass(Boolean(errors.category))}
            >
              <option value="">Selecciona una opción</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-base text-bo-danger">{errors.category}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="incident-origin" className="text-base font-medium text-bo-text">
              Origen
            </label>
            <select
              id="incident-origin"
              value={form.origin}
              aria-required="true"
              aria-invalid={Boolean(errors.origin)}
              onChange={(event) => updateField("origin", event.target.value as IncidentOrigin | "")}
              className={fieldClass(Boolean(errors.origin))}
            >
              <option value="">Selecciona una opción</option>
              {ORIGIN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.origin && <p className="text-base text-bo-danger">{errors.origin}</p>}
          </div>

          <div
            className={`flex flex-col gap-2 rounded-[18px] border-2 p-4 sm:col-span-2 ${
              isBranchOrigin ? "border-bo-accent bg-bo-accent-soft" : "border-transparent"
            }`}
          >
            <label htmlFor="incident-branch" className="text-base font-medium text-bo-text">
              Sede
            </label>
            <select
              id="incident-branch"
              value={form.branch}
              aria-required="true"
              aria-invalid={Boolean(errors.branch)}
              onChange={(event) => updateField("branch", event.target.value as IncidentBranch | "")}
              className={fieldClass(Boolean(errors.branch))}
            >
              <option value="">Selecciona una opción</option>
              {BRANCH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isBranchOrigin && (
              <p className="text-base text-bo-on-accent-soft">
                Estás reportando desde un local específico. Verifica que la sede sea correcta.
              </p>
            )}
            {errors.branch && <p className="text-base text-bo-danger">{errors.branch}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="incident-status" className="text-base font-medium text-bo-text">
              Estado
            </label>
            <select
              id="incident-status"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as IncidentStatus)}
              className={fieldClass(false)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="incident-description" className="text-base font-medium text-bo-text">
              Descripción
            </label>
            <textarea
              id="incident-description"
              rows={5}
              value={form.description}
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              onChange={(event) => updateField("description", event.target.value)}
              className={fieldClass(Boolean(errors.description))}
            />
            {errors.description && (
              <p className="text-base text-bo-danger">{errors.description}</p>
            )}
          </div>
        </div>

        {generalError && (
          <p role="alert" className="mt-6 text-base text-bo-danger">
            {generalError}
          </p>
        )}
        {success && (
          <p role="status" className="mt-6 text-base text-bo-success">
            {success}
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-bo-accent px-8 text-base font-medium text-bo-on-accent disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {saving && (
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-bo-on-accent border-t-transparent"
              />
            )}
            {saving ? "Enviando..." : "Registrar incidencia"}
          </button>
        </div>
      </form>
    </section>
  );
}
