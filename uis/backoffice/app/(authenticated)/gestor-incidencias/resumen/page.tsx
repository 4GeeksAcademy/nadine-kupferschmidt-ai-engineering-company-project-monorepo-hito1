"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  BRANCH_OPTIONS,
  CATEGORY_OPTIONS,
  ORIGIN_OPTIONS,
  STATUS_OPTIONS,
} from "../constants";
import type {
  IncidentBranch,
  IncidentCategory,
  IncidentOrigin,
  IncidentStatus,
} from "../types";

type Summary = {
  total: number;
  by_status: Record<IncidentStatus, number>;
  by_category: Record<IncidentCategory, number>;
  by_origin: Record<IncidentOrigin, number>;
  by_branch: Record<IncidentBranch, number>;
};

type Row = { key: string; label: string; count: number };

const LOAD_ERROR = "No pudimos cargar el resumen.";
const EMPTY_MESSAGE = "Todavía no hay incidencias registradas.";

const cardClass = "rounded-[18px] border border-bo-border bg-bo-surface p-5";
const primaryButtonClass =
  "min-h-11 rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text";

function toRows<T extends string>(
  options: readonly { value: T; label: string }[],
  counts: Record<T, number>,
  sortByCount: boolean,
): Row[] {
  const rows = options.map((option) => ({
    key: option.value,
    label: option.label,
    count: counts[option.value] ?? 0,
  }));
  return sortByCount ? rows.sort((a, b) => b.count - a.count) : rows;
}

function KpiCard({
  label,
  value,
  loading,
  highlighted = false,
}: {
  label: string;
  value: number;
  loading: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-5 ${
        highlighted ? "border-bo-accent-soft bg-bo-accent-soft" : "border-bo-border bg-bo-surface"
      }`}
    >
      <p className={`text-[13px] ${highlighted ? "text-bo-on-accent-soft" : "text-bo-muted"}`}>
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-[30px] w-16 animate-pulse rounded-md bg-bo-chip" />
      ) : (
        <p
          className={`mt-1 text-[30px] font-semibold tabular-nums ${
            highlighted ? "text-bo-on-accent-soft" : "text-bo-text"
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  total,
  skeletonCount,
  showBars,
}: {
  title: string;
  rows: Row[] | null;
  total: number;
  skeletonCount: number;
  showBars: boolean;
}) {
  return (
    <section aria-label={title} className={cardClass}>
      <h2 className="mb-4 text-base font-semibold text-bo-text">{title}</h2>
      {rows === null ? (
        <ul className="space-y-3" aria-hidden="true">
          {Array.from({ length: skeletonCount }, (_, index) => (
            <li key={index} className="h-4 w-full animate-pulse rounded bg-bo-chip" />
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const percent = total > 0 ? (row.count / total) * 100 : 0;
            return (
              <li key={row.key} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-bo-text">{row.label}</span>
                  <span className="font-medium tabular-nums text-bo-text">{row.count}</span>
                </div>
                {showBars && (
                  <div className="h-2 w-full rounded-full bg-bo-chip">
                    <div
                      className="h-2 rounded-full bg-bo-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function ResumenIncidenciasPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await apiFetch("/api/incidents/summary");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as Summary;
        if (!ignore) setSummary(data);
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
  }, [reloadKey]);

  const total = summary?.total ?? 0;
  const isEmpty = summary !== null && !loading && summary.total === 0;

  return (
    <div>
      <header className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-bo-muted">
          Operaciones / Incidencias
        </p>
        <h1 className="text-3xl font-semibold text-bo-text">Resumen de incidencias</h1>
        <p className="mt-1 text-sm text-bo-muted">
          Cuántas incidencias hay por estado, origen, categoría y sede.
        </p>
      </header>

      {loadError ? (
        <section className={`${cardClass} flex flex-col items-start gap-4`}>
          <p role="alert" className="text-sm text-bo-danger">
            {LOAD_ERROR}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className={primaryButtonClass}
          >
            Reintentar
          </button>
        </section>
      ) : (
        <div className="space-y-6" aria-busy={loading}>
          {isEmpty && <p className="text-sm text-bo-muted">{EMPTY_MESSAGE}</p>}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Total" value={total} loading={loading} />
            <KpiCard
              label="Abiertas"
              value={summary?.by_status.open ?? 0}
              loading={loading}
              highlighted
            />
            <KpiCard
              label="En curso"
              value={summary?.by_status.in_progress ?? 0}
              loading={loading}
            />
            <KpiCard
              label="Resueltas"
              value={summary?.by_status.resolved ?? 0}
              loading={loading}
            />
            <KpiCard
              label="Descartadas"
              value={summary?.by_status.discarded ?? 0}
              loading={loading}
            />
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="Por sede"
              rows={!loading && summary ? toRows(BRANCH_OPTIONS, summary.by_branch, true) : null}
              total={total}
              skeletonCount={15}
              showBars
            />
            <div className="flex flex-col gap-4">
              <BreakdownCard
                title="Por origen"
                rows={!loading && summary ? toRows(ORIGIN_OPTIONS, summary.by_origin, true) : null}
                total={total}
                skeletonCount={3}
                showBars
              />
              <BreakdownCard
                title="Por categoría"
                rows={!loading && summary ? toRows(CATEGORY_OPTIONS, summary.by_category, true) : null}
                total={total}
                skeletonCount={8}
                showBars
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
