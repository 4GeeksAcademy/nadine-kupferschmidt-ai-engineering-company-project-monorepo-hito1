import type { Category, Country, Status, Supplier, SupplierCreate } from "./types";
import { apiFetch } from "@/lib/api";

type SupplierFilters = {
  country?: Country;
  category?: Category;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Convierte los errores de FastAPI en mensajes legibles.
async function throwApiError(response: Response): Promise<never> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
    throw new Error(`No se pudo completar la solicitud (HTTP ${response.status}).`);
  }

  const detail = isRecord(payload) ? payload.detail : undefined;
  if (typeof detail === "string") {
    throw new Error(detail);
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (isRecord(item) ? item.msg : undefined))
      .filter((message): message is string => typeof message === "string");
    if (messages.length > 0) {
      const sentence = messages.join(". ");
      throw new Error(/[.!?]$/.test(sentence) ? sentence : `${sentence}.`);
    }
  }

  throw new Error(`No se pudo completar la solicitud (HTTP ${response.status}).`);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(url, init);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json() as Promise<T>;
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
