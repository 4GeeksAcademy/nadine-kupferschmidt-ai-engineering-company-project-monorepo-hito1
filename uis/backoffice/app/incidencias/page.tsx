"use client";

import { useRef, useState } from "react";
import type { AnalysisResponse, ApiError, Category, IncidentStatus, SatisfactionScore } from "./types";

const categories: { code: Category; description: string }[] = [
  { code: "CUSTOMER_COMPLAINT", description: "Queja de cliente (servicio, tiempo de espera, trato)" },
  { code: "EQUIPMENT", description: "Falla o avería de equipamiento" },
  { code: "SUPPLY", description: "Problema de abastecimiento o falta de stock" },
  { code: "FOOD_QUALITY", description: "Incidente de calidad de alimentos" },
  { code: "STAFF", description: "Incidente relacionado con personal" },
];
const statuses: { code: IncidentStatus; label: string; color: string }[] = [
  { code: "OPEN", label: "Abierto", color: "border-blue-600 text-blue-700" },
  { code: "CLOSED", label: "Cerrado", color: "border-green-600 text-green-700" },
  { code: "DISCARDED", label: "Descartado", color: "border-red-600 text-red-700" },
];
const scores: SatisfactionScore[] = ["1", "2", "3", "4", "5"];
const buttonClass = "inline-flex min-h-11 items-center justify-center rounded bg-brand-ochre px-4 py-2 text-sm text-brand-darkbrown hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50";

async function getApiError(response: Response): Promise<string> {
  try {
    const body: ApiError = await response.json();
    if (typeof body.detail === "string") return body.detail;
  } catch {
    return "La API no está disponible o ha devuelto una respuesta no válida.";
  }
  return "No se pudo completar la solicitud. Inténtalo de nuevo más tarde.";
}

export default function IncidentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const metrics = result?.metrics;
  const busy = analyzing || downloading;

  function chooseFile(selected: File | undefined) {
    if (!selected || busy) return;
    setResult(null);
    setError("");
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("El archivo debe terminar en .csv.");
      return;
    }
    setFile(selected);
  }

  async function analyze() {
    if (!file || busy) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/incidents/analyze", { method: "POST", body: formData });
      if (!response.ok) throw new Error(await getApiError(response));
      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (cause) {
      setError(cause instanceof TypeError ? "No se pudo conectar con la API. Comprueba que esté disponible." : cause instanceof Error ? cause.message : "No se pudo analizar el archivo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function download() {
    if (busy) return;
    setDownloading(true);
    setError("");
    try {
      const response = await fetch("/api/incidents/results/export", { cache: "no-store" });
      if (!response.ok) throw new Error(await getApiError(response));
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "results.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof TypeError ? "No se pudo conectar con la API para descargar los resultados." : cause instanceof Error ? cause.message : "No se pudieron descargar los resultados.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <header className="mb-8 border-b border-brand-beige bg-white px-5 py-5">
        <p className="mb-2 text-sm font-semibold uppercase text-brand-warmgray">Operaciones / Incidencias</p>
        <h1 className="text-2xl font-semibold text-brand-darkbrown">Análisis de incidencias</h1>
      </header>
      <section aria-labelledby="archivo-heading" aria-busy={analyzing}>
        <h2 id="archivo-heading" className="mb-4 text-sm font-semibold uppercase text-brand-warmgray">Archivo de incidencias</h2>
        <div
          onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files.length > 1) { if (!busy) setError("Selecciona un solo archivo CSV."); return; } chooseFile(event.dataTransfer.files[0]); }}
          className={`flex min-h-40 flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed p-6 text-center ${dragging ? "border-brand-ochre bg-brand-ivory" : "border-brand-beige bg-white"}`}
        >
          <p className="text-sm text-brand-warmgray">Arrastra un archivo CSV aquí</p>
          <input ref={inputRef} id="csv-file" type="file" accept=".csv" className="sr-only" tabIndex={-1} disabled={busy} onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ""; }} aria-label="Archivo CSV de incidencias" />
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="min-h-11 rounded border border-brand-beige bg-white px-4 py-2 text-sm text-brand-darkbrown hover:border-brand-ochre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown disabled:cursor-not-allowed disabled:opacity-50">Elegir archivo CSV</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="min-w-0 flex-1 break-all text-sm text-brand-warmgray" aria-live="polite">{file ? file.name : "Ningún archivo seleccionado"}</p>
          <button type="button" onClick={analyze} disabled={!file || busy} className={buttonClass}>{analyzing ? "Analizando..." : "Analizar"}</button>
        </div>
        <p role="status" className={`mt-2 text-sm ${result ? "text-green-700" : "text-brand-warmgray"}`}>{analyzing ? "Análisis en curso." : result ? "Análisis completado." : ""}</p>
      </section>
      <section aria-labelledby="como-funciona-heading" className="mb-8 rounded-md border border-brand-beige bg-white p-6">
        <h2 id="como-funciona-heading" className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-warmgray">¿Cómo funciona?</h2>
        <div className="space-y-4 text-sm text-brand-charcoal">
          <div>
            <h3 className="font-semibold text-brand-darkbrown">Para qué sirve</h3>
            <p className="mt-1">Valida y resume incidentes de las 14 sedes —equipos, abastecimiento, quejas, calidad de alimentos y personal— antes del dashboard de Operaciones. El análisis ocurre dentro de Brasaland; los datos no se envían a herramientas externas.</p>
          </div>
          <div>
            <h3 className="font-semibold text-brand-darkbrown">Qué archivo subir</h3>
            <p className="mt-1">CSV en UTF-8, separado por comas y con encabezado. Columnas exactas:</p>
            <p className="mt-1 break-words font-mono text-xs text-brand-warmgray">incident_id, date, location_id, category, description, status, customer_id, satisfaction_score, reporter_id</p>
          </div>
          <div>
            <h3 className="font-semibold text-brand-darkbrown">Pasos</h3>
            <ol className="mt-1 list-inside list-decimal space-y-1">
              <li>Elegí o arrastrá el archivo.</li>
              <li>Apretá “Analizar”.</li>
              <li>Revisá el resumen y descargá los resultados en CSV.</li>
            </ol>
          </div>
          <p><span className="font-semibold text-brand-darkbrown">Registros inválidos:</span> los datos faltantes o fuera de lo permitido se cuentan y muestran aparte, pero no se incluyen en las métricas.</p>
        </div>
      </section>
      {error && <div role="alert" className="mt-5 rounded-md border border-brand-beige border-l-4 border-l-red-600 bg-white px-5 py-4 text-sm text-red-600">{error}</div>}
      {result && metrics && (
        <div className="mt-10 space-y-9">
          <section aria-labelledby="resumen-heading">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 id="resumen-heading" className="text-sm font-semibold uppercase text-brand-warmgray">Resumen del análisis</h2>
              <button type="button" onClick={download} disabled={busy} className={buttonClass}>{downloading ? "Descargando..." : "Descargar resultados (CSV)"}</button>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {([{ label: "Total de registros", value: metrics.total }, { label: "Registros válidos", value: metrics.valid }, { label: "Registros inválidos", value: metrics.invalid }]).map(({ label, value }) => (
                <div key={label} className="rounded-md border border-brand-beige bg-white p-6"><dt className="text-sm text-brand-warmgray">{label}</dt><dd className="mt-2 text-3xl font-semibold text-brand-darkbrown tabular-nums">{value}</dd></div>
              ))}
            </dl>
          </section>
          {metrics.invalid > 0 && (
            <section aria-labelledby="invalidos-heading" className="border border-brand-beige border-l-4 border-l-brand-ochre bg-white px-5 py-5">
              <h2 id="invalidos-heading" className="font-semibold text-brand-darkbrown">{metrics.invalid} {metrics.invalid === 1 ? "registro requiere revisión" : "registros requieren revisión"}</h2>
              <ul className="mt-3 space-y-2 text-sm text-brand-charcoal">
                {result.invalid_rules.filter(({ code }) => metrics.invalid_counts[code] > 0).map(({ code, label }) => <li key={code} className="flex justify-between gap-5"><span>{label}</span><strong className="tabular-nums">{metrics.invalid_counts[code]}</strong></li>)}
              </ul>
            </section>
          )}
          <section aria-labelledby="categorias-heading" className="border-y border-brand-beige bg-white py-5">
            <h2 id="categorias-heading" className="mb-1 px-3 text-sm font-semibold uppercase text-brand-warmgray">Desglose por categoría</h2>
            <p className="mb-4 px-3 text-sm text-brand-warmgray">Registros válidos</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-brand-beige bg-gray-200 text-brand-charcoal"><tr><th scope="col" className="px-3 py-3 font-medium">Código</th><th scope="col" className="px-3 py-3 font-medium">Descripción</th><th scope="col" className="px-3 py-3 text-right font-medium">Cantidad</th><th scope="col" className="px-3 py-3 text-right font-medium">Porcentaje</th></tr></thead>
                <tbody className="divide-y divide-brand-beige">{categories.map(({ code, description }) => <tr key={code} className="hover:bg-brand-ivory"><th scope="row" className="px-3 py-4 text-xs font-medium">{code}</th><td className="min-w-52 px-3 py-4">{description}</td><td className="px-3 py-4 text-right tabular-nums">{metrics.category_counts[code]}</td><td className="px-3 py-4 text-right tabular-nums">{metrics.category_percentages[code].toFixed(1)} %</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <section aria-labelledby="estados-heading" className="border-y border-brand-beige bg-white py-5">
            <h2 id="estados-heading" className="mb-1 px-3 text-sm font-semibold uppercase text-brand-warmgray">Desglose por estado</h2>
            <p className="mb-4 px-3 text-sm text-brand-warmgray">Registros válidos</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-brand-beige bg-gray-200 text-brand-charcoal"><tr><th scope="col" className="px-3 py-3 font-medium">Código</th><th scope="col" className="px-3 py-3 font-medium">Estado</th><th scope="col" className="px-3 py-3 text-right font-medium">Cantidad</th><th scope="col" className="px-3 py-3 text-right font-medium">Porcentaje</th></tr></thead>
                <tbody className="divide-y divide-brand-beige">{statuses.map(({ code, label, color }) => <tr key={code} className="hover:bg-brand-ivory"><th scope="row" className="px-3 py-4 text-xs font-medium">{code}</th><td className="px-3 py-4"><span className={`inline-block rounded-full border px-2 py-0 text-xs font-medium ${color}`}>{label}</span></td><td className="px-3 py-4 text-right tabular-nums">{metrics.status_counts[code]}</td><td className="px-3 py-4 text-right tabular-nums">{metrics.status_percentages[code].toFixed(1)} %</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <section aria-labelledby="satisfaccion-heading" className="border-y border-brand-beige bg-white px-3 py-6">
            <h2 id="satisfaccion-heading" className="text-sm font-semibold uppercase text-brand-warmgray">Índice de satisfacción</h2>
            <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-3">
              <p className="text-3xl font-semibold text-brand-darkbrown tabular-nums">{metrics.average_score.toFixed(2)} <span className="text-base font-normal text-brand-warmgray">/ 5</span></p>
              <p className="text-sm text-brand-warmgray">{metrics.scored_cases} de {metrics.closed_cases} casos cerrados (CLOSED) con puntaje</p>
            </div>
            {metrics.scored_cases === 0 && <p className="mt-3 text-sm text-brand-warmgray">Sin puntajes de satisfacción registrados.</p>}
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">{scores.map((score) => <div key={score} className="border-t-2 border-brand-ochre py-3"><dt className="text-sm text-brand-warmgray">Puntaje {score}</dt><dd className="mt-2 text-xl font-semibold tabular-nums">{metrics.score_counts[score]}</dd></div>)}</dl>
          </section>
        </div>
      )}
    </div>
  );
}