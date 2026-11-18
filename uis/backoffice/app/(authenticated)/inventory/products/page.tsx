"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listIngredients } from "@/lib/inventory";
import type { Ingredient } from "@/types/inventory";
import { CATEGORY_LABELS, COUNTRY_LABELS, formatQuantity, getStockLevel } from "../constants";
import StockIndicator, { LEVEL_DOT_CLASSES, LEVEL_LEGEND } from "../StockIndicator";

const DEFAULT_ERROR_MESSAGE = "No se pudieron cargar los ingredientes.";

const SECONDARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-bo-border bg-bo-surface px-4 text-sm text-bo-text hover:bg-bo-stripe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadIngredients() {
      setLoading(true);
      setError("");
      try {
        const results = await listIngredients();
        if (active) setIngredients(results);
      } catch (cause) {
        if (active) {
          setIngredients([]);
          setError(cause instanceof Error ? cause.message : DEFAULT_ERROR_MESSAGE);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadIngredients();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-bo-text">Inventario de ingredientes</h1>
        <p className="mt-1 text-sm text-bo-muted">
          Stock actual de cada ingrediente, calculado a partir de las entradas y salidas registradas.
        </p>
      </header>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs text-bo-muted">
        {LEVEL_LEGEND.map(({ level, label, description }) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${LEVEL_DOT_CLASSES[level]}`} />
            {label}: {description}
          </span>
        ))}
        <span>Los límites dependen de la unidad (kg, litros o unidades).</span>
      </div>

      <section
        aria-label="Stock de ingredientes"
        aria-busy={loading}
        className="overflow-hidden rounded-[20px] border border-bo-border bg-bo-surface"
      >
        {error ? (
          <div className="flex flex-col items-start gap-4 p-6">
            <p role="alert" className="text-sm text-bo-danger">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="min-h-11 rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : loading ? (
          <p role="status" className="p-6 text-sm text-bo-muted">
            Cargando ingredientes…
          </p>
        ) : ingredients.length === 0 ? (
          <p className="p-6 text-sm text-bo-muted">Todavía no hay ingredientes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-bo-page text-xs font-medium text-bo-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Ingrediente</th>
                  <th scope="col" className="px-4 py-3 font-medium">SKU</th>
                  <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
                  <th scope="col" className="px-4 py-3 font-medium">País</th>
                  {/* Esta columna ocupa solo el ancho de su contenido. */}
                  <th scope="col" className="w-px whitespace-nowrap px-4 py-3 text-right font-medium">Stock actual</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">Registrar</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient, index) => (
                  <tr
                    key={ingredient.id}
                    className={index % 2 === 1 ? "bg-bo-stripe" : "bg-bo-surface"}
                  >
                    <td className="px-4 py-3 font-medium text-bo-text">{ingredient.name}</td>
                    <td className="px-4 py-3 text-bo-muted">{ingredient.sku}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-bo-chip px-2 text-xs font-medium text-bo-menu">
                        {CATEGORY_LABELS[ingredient.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bo-text">{COUNTRY_LABELS[ingredient.country]}</td>
                    <td className="w-px whitespace-nowrap px-4 py-3 text-right tabular-nums text-bo-text">
                      <div className="flex items-center justify-end gap-2">
                        {formatQuantity(ingredient.current_stock, ingredient.unit)}
                        <StockIndicator level={getStockLevel(ingredient.current_stock, ingredient.unit)} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          href={`/inventory/orders/inbound?ingredient=${ingredient.id}`}
                          className={SECONDARY_BUTTON_CLASS}
                          aria-label={`Registrar entrada de ${ingredient.name}`}
                          title={`Registrar entrada de ${ingredient.name}`}
                        >
                          Entrada
                        </Link>
                        <Link
                          href={`/inventory/orders/outbound?ingredient=${ingredient.id}`}
                          className={SECONDARY_BUTTON_CLASS}
                          aria-label={`Registrar salida de ${ingredient.name}`}
                          title={`Registrar salida de ${ingredient.name}`}
                        >
                          Salida
                        </Link>
                      </div>
                    </td>
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
