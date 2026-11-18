import type {
  ExitReason,
  IngredientCategory,
  IngredientCountry,
  IngredientUnit,
  OrderType,
} from "@/types/inventory";

// Etiquetas visibles en español para las categorías de ingredientes.
export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  meat: "Carne",
  produce: "Verduras",
  sauce: "Salsas",
  beverage: "Bebidas",
  packaging: "Envases",
  cleaning: "Limpieza",
};

// Etiquetas visibles para los países.
export const COUNTRY_LABELS: Record<IngredientCountry, string> = {
  CO: "Colombia",
  US: "Estados Unidos",
};

// Etiquetas visibles para el motivo de una salida.
export const EXIT_REASON_LABELS: Record<ExitReason, string> = {
  consumption: "Consumo",
  waste: "Merma",
};

// Etiquetas visibles para el tipo de orden.
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  inbound: "Entrada",
  outbound: "Salida",
};

// El briefing define los locales solo como números del 1 al 14; los nombres de las sedes se gestionan por separado.
export const LOCATION_IDS: number[] = Array.from({ length: 14 }, (_, index) => index + 1);

// Devuelve el nombre visible de un local.
export function formatLocation(id: number): string {
  return `Local ${id}`;
}

export type StockLevel = "low" | "warning" | "healthy";

// Umbrales de stock por unidad. Son distintos porque 10 kg de carne no equivalen a 10 cajas para llevar.
// Stock en "low" si es menor o igual a low; en "warning" si es menor o igual a warning; si no, "healthy".
export const STOCK_THRESHOLDS: Record<IngredientUnit, { low: number; warning: number }> = {
  kg: { low: 10, warning: 25 },
  litro: { low: 5, warning: 15 },
  unidad: { low: 50, warning: 150 },
};

// Indica el nivel de stock de un ingrediente según su unidad.
export function getStockLevel(stock: number, unit: IngredientUnit): StockLevel {
  const { low, warning } = STOCK_THRESHOLDS[unit];
  if (stock <= low) {
    return "low";
  }
  if (stock <= warning) {
    return "warning";
  }
  return "healthy";
}
