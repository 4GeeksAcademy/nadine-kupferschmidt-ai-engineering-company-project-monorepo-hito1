"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ALLOWED_TRANSITIONS,
  BRANCH_OPTIONS,
  CATEGORY_OPTIONS,
  ORIGIN_OPTIONS,
  STATUS_OPTIONS,
} from "./constants";
import type {
  Incident,
  IncidentBranch,
  IncidentOrigin,
  IncidentStatus,
} from "./types";

type Filters = {
  status: IncidentStatus | "";
  origin: IncidentOrigin | "";
  branch: IncidentBranch | "";
};

const emptyFilters: Filters = { status: "", origin: "", branch: "" };

const LOAD_ERROR = "No pudimos cargar las incidencias.";
const UPDATE_ERROR = "No pudimos actualizar el estado. Inténtalo de nuevo.";

const selectClass =
  "min-h-11 w-full rounded-[10px] border border-bo-border bg-bo-surface px-3 text-sm text-bo-text";

function labelOf<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? "Sin especificar";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

const linkButtonClass =
  "inline-flex min-h-11 items-center whitespace-nowrap text-xs text-bo-muted underline hover:text-bo-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50";

function statusPillClass(status: IncidentStatus): string {
  if (status === "resolved") return "bg-bo-chip text-bo-success";
  if (status === "discarded") return "bg-bo-chip text-bo-menu";
  if (status === "in_progress") return "bg-bo-progress-soft text-bo-on-progress-soft";
  return "bg-bo-accent-soft text-bo-on-accent-soft";
}

export default function GestorIncidenciasPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [actionError, setActionError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const hasActiveFilters = Boolean(filters.status || filters.origin || filters.branch);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const params = new URLSearchParams();
        if (filters.status) params.set("status", filters.status);
        if (filters.origin) params.set("origin", filters.origin);
        if (filters.branch) params.set("branch", filters.branch);
        const query = params.toString();

        const response = await apiFetch(`/api/incidents${query ? `?${query}` : ""}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as Incident[];
        if (!ignore) setIncidents(data);
      } catch {
        if (!ignore) setLoadError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [filters, reloadKey]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function replaceIncident(id: number, update: (row: Incident) => Incident) {
    setIncidents((current) => current.map((row) => (row.id === id ? update(row) : row)));
  }

  async function handleStatusChange(incident: Incident, nextStatus: IncidentStatus) {
    const previousStatus = incident.status;
    setActionError("");
    setPendingIds((current) => [...current, incident.id]);
    replaceIncident(incident.id, (row) => ({ ...row, status: nextStatus }));

    let failureMessage: string | null = null;
    try {
      const response = await apiFetch(`/api/incidents/${incident.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.status === 400) {
        const body = (await response.json()) as { message?: string };
        failureMessage = body.message || UPDATE_ERROR;
      } else if (!response.ok) {
        failureMessage = UPDATE_ERROR;
      } else {
        const updated = (await response.json()) as Incident;
        replaceIncident(incident.id, () => updated);
      }
    } catch {
      failureMessage = UPDATE_ERROR;
    } finally {
      setPendingIds((current) => current.filter((id) => id !== incident.id));
    }

    if (failureMessage) {
      replaceIncident(incident.id, (row) => ({ ...row, status: previousStatus }));
      setActionError(failureMessage);
    }
  }

  function renderStatusCell(incident: Incident) {
    const transitions = ALLOWED_TRANSITIONS[incident.status];
    const isPending = pendingIds.includes(incident.id);

    if (editingId === incident.id && transitions.length > 0) {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label={`Elegir nuevo estado de la incidencia #${incident.id}`}
            defaultValue=""
            autoFocus
            onChange={(event) => {
              setEditingId(null);
              handleStatusChange(incident, event.target.value as IncidentStatus);
            }}
            className="min-h-11 rounded-[10px] border border-bo-border bg-bo-surface px-3 text-sm text-bo-text"
          >
            <option value="" disabled>
              Elegir nuevo estado…
            </option>
            {transitions.map((status) => (
              <option key={status} value={status}>
                {labelOf(STATUS_OPTIONS, status)}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setEditingId(null)} className={linkButtonClass}>
            Cancelar
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${statusPillClass(
              incident.status,
            )}`}
          >
            {labelOf(STATUS_OPTIONS, incident.status)}
          </span>
          {transitions.length > 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setEditingId(incident.id)}
              aria-label={`Cambiar estado de la incidencia #${incident.id}`}
              className={linkButtonClass}
            >
              Cambiar
            </button>
          )}
        </div>
        {isPending && <span className="text-sm text-bo-muted">Guardando...</span>}
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-bo-muted">
            Operaciones / Incidencias
          </p>
          <h1 className="text-3xl font-semibold text-bo-text">Panel de incidencias</h1>
          <p className="mt-1 text-sm text-bo-muted">
            Consulta y actualiza el estado de las incidencias.
          </p>
        </div>
        <Link
          href="/gestor-incidencias/nueva"
          className="inline-flex min-h-11 items-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
        >
          Registrar incidencia
        </Link>
      </header>

      <section
        aria-label="Panel de incidencias"
        aria-busy={loading}
        className="overflow-hidden rounded-[20px] border border-bo-border bg-bo-surface"
      >
        <div
          role="search"
          aria-label="Filtros de incidencias"
          className="flex flex-wrap items-end gap-4 border-b border-bo-border p-5"
        >
          <label className="flex min-w-48 flex-col gap-1 text-sm text-bo-muted">
            Estado
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value as IncidentStatus | "")}
              className={selectClass}
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-48 flex-col gap-1 text-sm text-bo-muted">
            Origen
            <select
              value={filters.origin}
              onChange={(event) => updateFilter("origin", event.target.value as IncidentOrigin | "")}
              className={selectClass}
            >
              <option value="">Todos</option>
              {ORIGIN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-48 flex-col gap-1 text-sm text-bo-muted">
            Sede
            <select
              value={filters.branch}
              onChange={(event) => updateFilter("branch", event.target.value as IncidentBranch | "")}
              className={selectClass}
            >
              <option value="">Todas</option>
              {BRANCH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setFilters(emptyFilters)}
            disabled={!hasActiveFilters}
            className="min-h-11 rounded-full border border-bo-border bg-bo-surface px-4 text-sm text-bo-text hover:bg-bo-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar filtros
          </button>

          <p className="ml-auto self-center text-sm text-bo-muted" aria-live="polite">
            {incidents.length} {incidents.length === 1 ? "incidencia" : "incidencias"}
          </p>
        </div>

        {actionError && (
          <p role="alert" className="m-5 rounded-[10px] bg-bo-danger-soft p-3 text-sm text-bo-on-danger-soft">
            {actionError}
          </p>
        )}

        {loading && (
          <div role="status" className="flex items-center gap-3 p-6 text-sm text-bo-muted">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-bo-accent border-t-transparent"
            />
            Cargando incidencias...
          </div>
        )}

        {!loading && loadError && (
          <div className="flex flex-col items-start gap-4 p-6">
            <p role="alert" className="text-sm text-bo-danger">
              {LOAD_ERROR}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="min-h-11 rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !loadError && incidents.length === 0 && (
          <div className="flex flex-col items-start gap-4 p-6">
            <p className="text-sm text-bo-muted">
              {hasActiveFilters
                ? "No hay incidencias que coincidan con los filtros."
                : "Todavía no hay incidencias registradas."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="min-h-11 rounded-full border border-bo-border bg-bo-surface px-4 text-sm text-bo-text hover:bg-bo-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!loading && !loadError && incidents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-bo-page text-xs font-medium text-bo-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">#</th>
                  <th scope="col" className="px-4 py-3 font-medium">Título</th>
                  <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
                  <th scope="col" className="px-4 py-3 font-medium">Sede</th>
                  <th scope="col" className="px-4 py-3 font-medium">Origen</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 font-medium">Creada</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident, index) => (
                  <tr
                    key={incident.id}
                    className={`border-t border-bo-divider align-middle ${
                      index % 2 === 1 ? "bg-bo-stripe" : "bg-bo-surface"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-bo-text">{incident.id}</td>
                    <td className="px-4 py-3 text-bo-text">{incident.title}</td>
                    <td className="px-4 py-3 text-bo-text">
                      {labelOf(CATEGORY_OPTIONS, incident.category)}
                    </td>
                    <td className="px-4 py-3 text-bo-text">{labelOf(BRANCH_OPTIONS, incident.branch)}</td>
                    <td className="px-4 py-3 text-bo-text">{labelOf(ORIGIN_OPTIONS, incident.origin)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{renderStatusCell(incident)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-bo-muted">{formatDate(incident.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
