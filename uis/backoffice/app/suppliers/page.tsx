"use client";

import { useEffect, useState } from "react";
import { getSuppliers } from "./api";
import SupplierFilters, {
  type SupplierFilterValues,
} from "./SupplierFilters";
import SupplierTable from "./SupplierTable";
import type { Supplier } from "./types";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filters, setFilters] = useState<SupplierFilterValues>({
    country: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSuppliers() {
      setLoading(true);
      setError("");
      try {
        const results = await getSuppliers({
          country: filters.country || undefined,
          category: filters.category || undefined,
        });
        if (active) setSuppliers(results);
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los proveedores.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSuppliers();
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <div>
      <header className="mb-8 border-b border-brand-beige bg-white px-5 py-5">
        <p className="mb-2 text-sm font-semibold uppercase text-brand-warmgray">
          Compras / Proveedores
        </p>
        <h1 className="text-2xl font-semibold text-brand-darkbrown">
          Directorio de proveedores
        </h1>
      </header>

      <SupplierFilters filters={filters} onChange={setFilters} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-warmgray">
          Proveedores
        </h2>
        <p className="text-sm text-brand-warmgray" aria-live="polite">
          {suppliers.length} {suppliers.length === 1 ? "proveedor" : "proveedores"}
        </p>
      </div>

      <section aria-label="Directorio de proveedores" aria-busy={loading}>
        {error ? (
          <p role="alert" className="rounded-md border border-brand-beige bg-white p-6 text-sm text-red-600">
            {error}
          </p>
        ) : loading ? (
          <p role="status" className="rounded-md border border-brand-beige bg-white p-6 text-sm text-brand-warmgray">
            Cargando proveedores…
          </p>
        ) : suppliers.length === 0 ? (
          <p className="rounded-md border border-brand-beige bg-white p-6 text-sm text-brand-warmgray">
            No hay proveedores con estos filtros.
          </p>
        ) : (
          <SupplierTable suppliers={suppliers} />
        )}
      </section>
    </div>
  );
}
