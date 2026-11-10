"use client";

import {
  CATEGORIES,
  CATEGORY_LABELS,
  COUNTRIES,
  type Category,
  type Country,
} from "./types";

export type SupplierFilterValues = {
  country: Country | "";
  category: Category | "";
};

type SupplierFiltersProps = {
  filters: SupplierFilterValues;
  onChange: (filters: SupplierFilterValues) => void;
  count?: number;
};

const countryTabs: { value: Country | ""; label: string }[] = [
  { value: "", label: "Todos" },
  ...COUNTRIES.map((country) => ({
    value: country,
    label: country === "USA" ? "Estados Unidos" : country,
  })),
];

// Los filtros se envían a la API; aquí solo se seleccionan.
export default function SupplierFilters({
  filters,
  onChange,
  count,
}: SupplierFiltersProps) {
  return (
    <div
      role="search"
      aria-label="Filtros de proveedores"
      className="flex flex-wrap items-end gap-4 border-b border-bo-border p-5"
    >
      <div role="group" aria-label="País" className="flex rounded-full bg-bo-tabs p-1">
        {countryTabs.map((tab) => {
          const selected = filters.country === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange({ ...filters, country: tab.value })}
              className={`min-h-11 rounded-full px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text ${
                selected ? "bg-bo-text font-medium text-white" : "text-bo-menu"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <label className="flex min-w-48 flex-col gap-1 text-sm text-bo-muted">
        Categoría
        <select
          value={filters.category}
          onChange={(event) =>
            onChange({
              ...filters,
              category: event.target.value as Category | "",
            })
          }
          className="min-h-11 rounded-[10px] border border-bo-border bg-bo-surface px-3 text-bo-text"
        >
          <option value="">Todas</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => onChange({ country: "", category: "" })}
        className="min-h-11 rounded-full border border-bo-border bg-bo-surface px-4 text-sm text-bo-text hover:bg-bo-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
      >
        Limpiar filtros
      </button>

      {count !== undefined && (
        <p className="ml-auto self-center text-sm text-bo-muted" aria-live="polite">
          {count} {count === 1 ? "proveedor" : "proveedores"}
        </p>
      )}
    </div>
  );
}
