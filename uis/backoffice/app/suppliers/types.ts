// Valores permitidos por la API.
export type Status = "active" | "suspended";
export type Country = "Colombia" | "USA";
export type Currency = "COP" | "USD";
export type Category =
  | "carne"
  | "verduras_y_hortalizas"
  | "salsas_y_condimentos"
  | "bebidas"
  | "packaging"
  | "productos_limpieza"
  | "lacteos"
  | "carbon_y_combustible";

export interface Supplier {
  id: number;
  name: string;
  country: Country;
  categories: Category[];
  rate_per_unit: number;
  currency: Currency;
  status: Status;
  contact_email: string | null;
  notes: string | null;
  updated_at: string;
}

export interface SupplierCreate {
  name: string;
  country: Country;
  categories: Category[];
  rate_per_unit: number;
  currency: Currency;
  status: Status;
  contact_email?: string | null;
  notes?: string | null;
}

// Etiquetas visibles para no mostrar los valores internos.
export const CATEGORY_LABELS: Record<Category, string> = {
  carne: "Carne",
  verduras_y_hortalizas: "Verduras y hortalizas",
  salsas_y_condimentos: "Salsas y condimentos",
  bebidas: "Bebidas",
  packaging: "Empaques",
  productos_limpieza: "Productos de limpieza",
  lacteos: "Lácteos",
  carbon_y_combustible: "Carbón y combustible",
};

export const STATUS_LABELS: Record<Status, string> = {
  active: "Activo",
  suspended: "Suspendido",
};

export const COUNTRIES: Country[] = ["Colombia", "USA"];
export const CATEGORIES: Category[] = [
  "carne",
  "verduras_y_hortalizas",
  "salsas_y_condimentos",
  "bebidas",
  "packaging",
  "productos_limpieza",
  "lacteos",
  "carbon_y_combustible",
];

// La moneda depende del país del proveedor.
export const COUNTRY_CURRENCY: Record<Country, Currency> = {
  Colombia: "COP",
  USA: "USD",
};
