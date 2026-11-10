import type { Category, Country, Status, Supplier, SupplierCreate } from "./types";
import { apiFetch, SESSION_EXPIRED_MESSAGE } from "@/lib/api";

type SupplierFilters = {
  country?: Country;
  category?: Category;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Convierte los errores de FastAPI en mensajes legibles.
async function throwApiError(response: Response): Promise<never> {
  let detail: unknown;
  try {
    const payload: unknown = await response.json();
    detail = isRecord(payload) ? payload.detail : undefined;
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  throw new Error(messageForStatus(response.status, detail));
}

function messageForStatus(status: number, detail: unknown): string {
  if (status === 401) return SESSION_EXPIRED_MESSAGE;
  if (status === 404) return "No encontramos lo que buscas.";
  if (status >= 500) return "Algo falló en el servidor. Intenta de nuevo en unos minutos.";
  if (status === 400 || status === 422) {
    return typeof detail === "string" ? detail : "Revisa los datos del formulario.";
  }
  return typeof detail === "string" ? detail : "No se pudo completar la solicitud. Intenta de nuevo.";
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(url, init);
  if (!response.ok) {
    await throwApiError(response);
  }
  try {
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("El servidor devolvió una respuesta inesperada. Intenta de nuevo.");
    }
    throw error;
  }
}

function jsonRequest(method: "POST" | "PATCH", body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Agrega únicamente los filtros seleccionados.
export function getSuppliers(filters: SupplierFilters = {}): Promise<Supplier[]> {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.category) params.set("category", filters.category);
  const query = params.toString();

  return request(`/api/suppliers${query ? `?${query}` : ""}`);
}

export function createSupplier(data: SupplierCreate): Promise<Supplier> {
  return request("/api/suppliers", jsonRequest("POST", data));
}

export function updateRate(
  id: number,
  rate_per_unit: number,
): Promise<Supplier> {
  return request(
    `/api/suppliers/${id}/rate`,
    jsonRequest("PATCH", { rate_per_unit }),
  );
}

export function updateStatus(id: number, status: Status): Promise<Supplier> {
  return request(
    `/api/suppliers/${id}/status`,
    jsonRequest("PATCH", { status }),
  );
}

export function deleteSupplier(id: number): Promise<{ message: string }> {
  return request(`/api/suppliers/${id}`, { method: "DELETE" });
}
