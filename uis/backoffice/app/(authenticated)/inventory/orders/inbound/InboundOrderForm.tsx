"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createIngredientEntry, listIngredients } from "@/lib/inventory";
import type { Ingredient } from "@/types/inventory";
import {
  LOCATION_IDS,
  UNIT_LABELS,
  formatLocation,
  formatQuantity,
} from "../../constants";

type SuccessInfo = {
  quantityText: string;
  ingredientName: string;
  locationText: string;
};

const fieldClass =
  "min-h-11 w-full rounded-[10px] border border-bo-border bg-bo-surface px-3 text-sm text-bo-text";

const GENERAL_ERROR = "No se pudo registrar la entrada.";

export default function InboundOrderForm() {
  const searchParams = useSearchParams();
  const preselectedId = Number(searchParams.get("ingredient"));

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [locationId, setLocationId] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

  useEffect(() => {
    let active = true;
    listIngredients()
      .then((items) => {
        if (!active) return;
        setIngredients(items);
        if (items.some((item) => item.id === preselectedId)) {
          setIngredientId(String(preselectedId));
        }
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setLoadError(
          cause instanceof Error ? cause.message : "No se pudieron cargar los ingredientes.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [preselectedId]);

  const selected = ingredients.find((item) => String(item.id) === ingredientId);
  const unitLabel = selected ? UNIT_LABELS[selected.unit].plural : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSuccess(null);

    if (!selected) return;

    const quantityValue = Number(quantity);
    const locationValue = Number(locationId);
    const supplierValue = supplierName.trim();

    setSaving(true);
    try {
      await createIngredientEntry({
        ingredient_id: selected.id,
        quantity: quantityValue,
        supplier_name: supplierValue,
        location_id: locationValue,
      });
      setSuccess({
        quantityText: formatQuantity(quantityValue, selected.unit),
        ingredientName: selected.name,
        locationText: formatLocation(locationValue),
      });
      setIngredientId("");
      setQuantity("");
      setSupplierName("");
      setLocationId("");
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : GENERAL_ERROR);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-bo-border bg-bo-surface p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="inbound-ingredient" className="text-sm text-bo-muted">
            Ingrediente
          </label>
          <select
            id="inbound-ingredient"
            value={ingredientId}
            required
            disabled={loading || Boolean(loadError)}
            onChange={(event) => setIngredientId(event.target.value)}
            className={fieldClass}
          >
            <option value="">
              {loading ? "Cargando ingredientes…" : "Elegí un ingrediente"}
            </option>
            {ingredients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.sku})
              </option>
            ))}
          </select>
          {loadError && (
            <p role="alert" className="text-sm text-bo-danger">
              {loadError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="inbound-quantity" className="text-sm text-bo-muted">
            Cantidad
          </label>
          <div className="flex items-center gap-2">
            <input
              id="inbound-quantity"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className={fieldClass}
            />
            <span className="whitespace-nowrap text-sm text-bo-muted">{unitLabel}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="inbound-supplier" className="text-sm text-bo-muted">
            Proveedor
          </label>
          <input
            id="inbound-supplier"
            type="text"
            placeholder="Ej.: Carnes del Valle S.A."
            required
            value={supplierName}
            onChange={(event) => setSupplierName(event.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="inbound-location" className="text-sm text-bo-muted">
            Local
          </label>
          <select
            id="inbound-location"
            value={locationId}
            required
            onChange={(event) => setLocationId(event.target.value)}
            className={fieldClass}
          >
            <option value="">Elegí un local</option>
            {LOCATION_IDS.map((id) => (
              <option key={id} value={id}>
                {formatLocation(id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {success && (
        <p role="status" className="mt-4 text-sm text-bo-success">
          Entrada registrada: {success.quantityText} de {success.ingredientName} en{" "}
          {success.locationText}.{" "}
          <Link href="/inventory/products" className="underline underline-offset-2">
            Ver inventario
          </Link>
        </p>
      )}
      {submitError && (
        <p role="alert" className="mt-4 text-sm text-bo-danger">
          {submitError}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Registrando…" : "Registrar entrada"}
        </button>
      </div>
    </form>
  );
}
