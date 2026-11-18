// Valores permitidos por la API de inventario.
export type IngredientUnit = "kg" | "litro" | "unidad";
export type IngredientCategory =
  | "meat"
  | "produce"
  | "sauce"
  | "beverage"
  | "packaging"
  | "cleaning";
export type IngredientCountry = "CO" | "US";
export type ExitReason = "consumption" | "waste";
export type OrderType = "inbound" | "outbound";

// Ingrediente con el stock calculado (entradas menos salidas).
export type Ingredient = {
  id: number;
  name: string;
  sku: string;
  unit: IngredientUnit;
  category: IngredientCategory;
  country: IngredientCountry;
  current_stock: number;
};

// Datos para registrar una entrega de proveedor.
export type IngredientEntryCreate = {
  ingredient_id: number;
  quantity: number;
  supplier_name: string;
  location_id: number;
};

// Entrega de proveedor devuelta por la API. Las fechas llegan como texto.
export type IngredientEntry = {
  id: number;
  ingredient_id: number;
  quantity: number;
  supplier_name: string;
  location_id: number;
  created_at: string;
  user_uuid: string;
};

// Datos para registrar un consumo o merma.
export type IngredientExitCreate = {
  ingredient_id: number;
  quantity: number;
  reason: ExitReason;
  location_id: number;
};

// Salida de ingrediente devuelta por la API. Las fechas llegan como texto.
export type IngredientExit = {
  id: number;
  ingredient_id: number;
  quantity: number;
  reason: ExitReason;
  location_id: number;
  created_at: string;
  user_uuid: string;
};

// Entrada o salida que devuelve GET /inventory/orders.
export type InventoryOrder = {
  id: number;
  order_type: OrderType;
  ingredient_id: number;
  ingredient_name: string;
  ingredient_sku: string;
  unit: IngredientUnit;
  quantity: number;
  location_id: number;
  supplier_name: string | null;
  reason: ExitReason | null;
  user_uuid: string;
  created_at: string;
};
