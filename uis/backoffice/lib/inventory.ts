import { apiFetch } from "@/lib/api";
import type {
  Ingredient,
  IngredientEntry,
  IngredientEntryCreate,
  IngredientExit,
  IngredientExitCreate,
  InventoryOrder,
} from "@/types/inventory";

const INVENTORY_BASE_PATH = "/api/inventory";

// Error de la API de inventario con el código HTTP de la respuesta.
export class InventoryApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "InventoryApiError";
    this.status = status;
  }
}

// Convierte el cuerpo de error de FastAPI en un mensaje legible.
async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `Error ${response.status} al comunicarse con la API de inventario.`;

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return fallback;
  }

  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") {
    return detail;
  }

  // Errores 422: FastAPI devuelve una lista con un "msg" por campo
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item as { msg?: unknown } | null)?.msg)
      .filter((msg): msg is string => typeof msg === "string");
    if (messages.length > 0) {
      return `Algunos datos no son válidos: ${messages.join("; ")}`;
    }
  }

  return fallback;
}

// Llama a la API de inventario y devuelve el JSON tipado.
async function inventoryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await apiFetch(`${INVENTORY_BASE_PATH}${path}`, { ...init, headers });
  if (!response.ok) {
    throw new InventoryApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

// Lista todos los ingredientes con su stock actual.
export function listIngredients(): Promise<Ingredient[]> {
  return inventoryFetch<Ingredient[]>("/products");
}

// Obtiene un ingrediente por su id.
export function getIngredient(id: number): Promise<Ingredient> {
  return inventoryFetch<Ingredient>(`/products/${id}`);
}

// Registra una entrega de proveedor.
export function createIngredientEntry(data: IngredientEntryCreate): Promise<IngredientEntry> {
  return inventoryFetch<IngredientEntry>("/orders/inbound", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Registra un consumo o merma.
export function createIngredientExit(data: IngredientExitCreate): Promise<IngredientExit> {
  return inventoryFetch<IngredientExit>("/orders/outbound", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Lista entradas y salidas, de la más nueva a la más vieja.
export function listInventoryOrders(): Promise<InventoryOrder[]> {
  return inventoryFetch<InventoryOrder[]>("/orders");
}
