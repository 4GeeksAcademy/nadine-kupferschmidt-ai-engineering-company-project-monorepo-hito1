"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  InventoryApiError,
  createIngredientExit,
  getIngredient,
  listIngredients,
} from "@/lib/inventory";
import type { ExitReason, Ingredient } from "@/types/inventory";
import {
  EXIT_REASON_LABELS,
  LOCATION_IDS,
  UNIT_LABELS,
  formatLocation,
  formatQuantity,
  getStockLevel,
} from "../../constants";
import StockIndicator from "../../StockIndicator";

type StockState = {
  id: number;
  ingredient?: Ingredient;
  error?: string;
};

const fieldClass =
  "min-h-11 w-full rounded-[10px] border border-bo-border bg-bo-surface px-3 text-sm text-bo-text";

const GENERAL_ERROR = "No se pudo registrar la salida.";
const STOCK_ERROR = "No se pudo consultar el stock.";

// Consulta el stock actual de un ingrediente sin lanzar errores.
async function fetchStock(id: number): Promise<StockState> {
  try {
    return { id, ingredient: await getIngredient(id) };
  } catch (cause) {
    return { id, error: cause instanceof Error ? cause.message : STOCK_ERROR };
  }
}

export default function OutboundOrderForm() {
  const searchParams = useSearchParams();
  const preselectedId = Number(searchParams.get("ingredient"));

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [locationId, setLocationId] = useState("");

  const [stockState, setStockState] = useState<StockState | null>(null);

  const [saving, setSaving] = useState(false);
  const [quantityError, setQuantityError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    if (!ingredientId) return;
    let active = true;
    fetchStock(Number(ingredientId)).then((result) => {
      if (active) setStockState(result);
    });
    return () => {
      active = false;
    };
  }, [ingredientId]);

  const selectedId = ingredientId ? Number(ingredientId) : null;
  const selected = ingredients.find((item) => item.id === selectedId);
  // Solo se usa el stock si corresponde al ingrediente elegido ahora.
  const currentStock = stockState && stockState.id === selectedId ? stockState : null;
  const stockLoading = selectedId !== null && currentStock === null;
  const availableStock = currentStock?.ingredient?.current_stock;
  const quantityNumber = Number(quantity);

  // Si la API ya rechazó la cantidad, no se repite con la advertencia.
  const overStockMessage =
    !quantityError && selected && availableStock !== undefined && quantityNumber > availableStock
      ? `La cantidad supera el stock disponible (${formatQuantity(availableStock, selected.unit)}). El sistema va a rechazar esta salida.`
      : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuantityError("");
    setSubmitError("");
    setSuccess("");

    if (!selected || selectedId === null) return;

    const reasonValue = reason as ExitReason;
    const locationValue = Number(locationId);

    setSaving(true);
    try {
      await createIngredientExit({
        ingredient_id: selectedId,
        quantity: quantityNumber,
        reason: reasonValue,
        location_id: locationValue,
      });
      setSuccess(
        `Salida registrada: ${formatQuantity(quantityNumber, selected.unit)} de ${selected.name} (${EXIT_REASON_LABELS[reasonValue]}) en ${formatLocation(locationValue)}.`,
      );
      setIngredientId("");
      setQuantity("");
      setReason("");
      setLocationId("");
      setStockState(null);
    } catch (cause) {
      if (cause instanceof InventoryApiError && cause.status === 400) {
        setQuantityError(cause.message);
        // Refresca el stock para que el número mostrado esté al día.
        setStockState(null);
        setStockState(await fetchStock(selectedId));
      } else {
        setSubmitError(cause instanceof Error ? cause.message : GENERAL_ERROR);
      }
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
          <label htmlFor="outbound-ingredient" className="text-sm text-bo-muted">
            Ingrediente
          </label>
          <select
            id="outbound-ingredient"
            value={ingredientId}
            required
            disabled={loading || Boolean(loadError)}
            onChange={(event) => {
              setIngredientId(event.target.value);
              setQuantityError("");
            }}
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

          {stockLoading && selectedId !== null && (
            <p className="text-sm text-bo-muted">Consultando stock…</p>
          )}
          {currentStock?.error && (
            <p role="alert" className="text-sm text-bo-danger">
              {currentStock.error}
            </p>
          )}
          {currentStock?.ingredient && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-bo-muted">
              <span>
                Stock disponible:{" "}
                <span className="font-medium tabular-nums text-bo-text">
                  {formatQuantity(
                    currentStock.ingredient.current_stock,
                    currentStock.ingredient.unit,
                  )}
                </span>
              </span>
              <StockIndicator
                level={getStockLevel(
                  currentStock.ingredient.current_stock,
                  currentStock.ingredient.unit,
                )}
              />
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="outbound-quantity" className="text-sm text-bo-muted">
            Cantidad
          </label>
          <div className="flex items-center gap-2">
            <input
              id="outbound-quantity"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value);
                setQuantityError("");
              }}
              className={fieldClass}
            />
            <span className="whitespace-nowrap text-sm text-bo-muted">
              {selected ? UNIT_LABELS[selected.unit].plural : ""}
            </span>
          </div>
          <p aria-live="polite" className="text-sm text-[#6E3C0B]">
            {overStockMessage}
          </p>
          {quantityError && (
            <p role="alert" className="text-sm text-bo-danger">
              {quantityError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="outbound-reason" className="text-sm text-bo-muted">
            Motivo
          </label>
          <select
            id="outbound-reason"
            value={reason}
            required
            onChange={(event) => setReason(event.target.value)}
            className={fieldClass}
          >
            <option value="">Elegí un motivo</option>
            {(Object.keys(EXIT_REASON_LABELS) as ExitReason[]).map((value) => (
              <option key={value} value={value}>
                {EXIT_REASON_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="outbound-location" className="text-sm text-bo-muted">
            Local
          </label>
          <select
            id="outbound-location"
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
          {success}{" "}
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
          {saving ? "Registrando…" : "Registrar salida"}
        </button>
      </div>
    </form>
  );
}
