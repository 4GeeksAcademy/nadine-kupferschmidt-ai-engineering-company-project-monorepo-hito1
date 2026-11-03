"use client";

import { useEffect, useState } from "react";
import { getSuppliers } from "./api";
import SupplierForm from "./SupplierForm";
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
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [filters, refreshKey]);

  function updateSupplier(updatedSupplier: Supplier) {
    setSuppliers((current) =>
      current.map((supplier) =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier,
      ),
    );
  }

  function removeSupplier(id: number) {
    setSuppliers((current) => current.filter((supplier) => supplier.id !== id));
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-bo-muted">
            Compras / Proveedores
          </p>
          <h1 className="text-3xl font-semibold text-bo-text">
            Directorio de proveedores
          </h1>
          <p className="mt-1 text-sm text-bo-muted">
            Tarifas, categorías y estado de los proveedores de Colombia y Florida.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((visible) => !visible)}
          aria-expanded={showForm}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Registrar proveedor
        </button>
      </header>

      {showForm && (
        <SupplierForm onCreated={() => setRefreshKey((key) => key + 1)} />
      )}

      <section
        aria-label="Directorio de proveedores"
        aria-busy={loading}
        className="overflow-hidden rounded-[20px] border border-bo-border bg-bo-surface"
      >
        <SupplierFilters
          filters={filters}
          onChange={setFilters}
          count={suppliers.length}
        />

        {error ? (
          <p role="alert" className="p-6 text-sm text-bo-danger">
            {error}
          </p>
        ) : loading ? (
          <p role="status" className="p-6 text-sm text-bo-muted">
            Cargando proveedores…
          </p>
        ) : suppliers.length === 0 ? (
          <p className="p-6 text-sm text-bo-muted">
            No hay proveedores con estos filtros.
          </p>
        ) : (
          <SupplierTable
            suppliers={suppliers}
            onUpdated={updateSupplier}
            onDeleted={removeSupplier}
          />
        )}
      </section>
    </div>
  );
}
