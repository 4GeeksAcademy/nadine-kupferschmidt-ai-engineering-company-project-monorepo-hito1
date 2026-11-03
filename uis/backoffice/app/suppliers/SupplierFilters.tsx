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
};

// Los filtros se envían a la API; aquí solo se seleccionan.
export default function SupplierFilters({
  filters,
  onChange,
}: SupplierFiltersProps) {
  return (
    <section
      aria-label="Filtros de proveedores"
      className="mb-6 rounded-md border border-brand-beige bg-white p-6"
    >
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm text-brand-warmgray">
          País
          <select
            value={filters.country}
            onChange={(event) =>
              onChange({
                ...filters,
                country: event.target.value as Country | "",
              })
            }
            className="rounded border border-brand-beige bg-white px-3 py-2 text-brand-charcoal"
          >
            <option value="">Todos</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country === "USA" ? "Estados Unidos" : country}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm text-brand-warmgray">
          Categoría
          <select
            value={filters.category}
            onChange={(event) =>
              onChange({
                ...filters,
                category: event.target.value as Category | "",
              })
            }
            className="rounded border border-brand-beige bg-white px-3 py-2 text-brand-charcoal"
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
          className="rounded border border-brand-beige bg-white px-4 py-2 text-sm text-brand-darkbrown hover:border-brand-ochre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-darkbrown"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}
