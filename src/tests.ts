import * as assert from "node:assert/strict";
import type { Location, MenuItem, SaleTransaction, WasteRecord } from "./types/models";
import {
  findLocationById,
  findMenuItemByName,
  binarySearchLocationByCapacity,
} from "./utils/search";
import {
  filterActiveLocations,
  filterMenuItemsByCategory,
  sortLocationsByCapacity,
  sortMenuItemsByPrice,
  filterSalesByLocation,
  filterSalesByDateRange,
} from "./utils/collections";
import {
  calculateDailyRevenue,
  calculateLocationMargin,
  calculateWasteCost,
  convertCurrency,
  getTimeZoneByCountry,
  scoreLocationPerformance,
  rankLocationsByPerformance,
  countSalesByPaymentMethod,
  calculateAverageTicket,
  findTopSellingItems,
  groupWasteByReason,
  calculateCountryComparison,
  findExtremeSales,
  findExtremeLocationRevenue,
} from "./utils/transformations";
import { validateMenuItem, validateSaleTransaction, validateLocation } from "./utils/validations";

const locations: Location[] = [
  {
    id: "TEST-LOC-1",
    name: "Local Centro",
    city: "Bogota",
    country: "Colombia",
    openingYear: 2020,
    seatingCapacity: 80,
    staffCount: 10,
    monthlyRentCost: { USD: 1500, COP: 6000000 },
    averageMonthlyUtilities: { USD: 300, COP: 1200000 },
    manager: "Ana",
    status: "Active",
  },
  {
    id: "TEST-LOC-2",
    name: "Local Norte",
    city: "Bogota",
    country: "Colombia",
    openingYear: 2021,
    seatingCapacity: 40,
    staffCount: 6,
    monthlyRentCost: { USD: 1000, COP: 4000000 },
    averageMonthlyUtilities: { USD: 200, COP: 800000 },
    manager: "Luis",
    status: "Temporarily closed",
  },
  {
    id: "TEST-LOC-3",
    name: "Local Miami",
    city: "Miami",
    country: "USA",
    openingYear: 2022,
    seatingCapacity: 100,
    staffCount: 12,
    monthlyRentCost: { USD: 5000, COP: 20000000 },
    averageMonthlyUtilities: { USD: 700, COP: 2800000 },
    manager: "Alex",
    status: "Active",
  },
  {
    id: "TEST-LOC-4",
    name: "Local Orlando",
    city: "Orlando",
    country: "USA",
    openingYear: 2023,
    seatingCapacity: 60,
    staffCount: 8,
    monthlyRentCost: { USD: 4000, COP: 16000000 },
    averageMonthlyUtilities: { USD: 500, COP: 2000000 },
    manager: "Sam",
    status: "Under renovation",
  },
];

const menuItems: MenuItem[] = [
  {
    id: "TEST-ITEM-1",
    name: "Carne a la parrilla",
    category: "Meat",
    basePrice: { USD: 20, COP: 80000 },
    ingredientCost: { USD: 8, COP: 32000 },
    prepTimeMinutes: 20,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "TEST-ITEM-2",
    name: "Papas fritas",
    category: "Side",
    basePrice: { USD: 5, COP: 12000 },
    ingredientCost: { USD: 1, COP: 4000 },
    prepTimeMinutes: 8,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "TEST-ITEM-3",
    name: "Limonada",
    category: "Beverage",
    basePrice: { USD: 3, COP: 16000 },
    ingredientCost: { USD: 1, COP: 4000 },
    prepTimeMinutes: 4,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
];

const sales: SaleTransaction[] = [
  {
    id: "TEST-TXN-1",
    locationId: "TEST-LOC-1",
    itemId: "TEST-ITEM-1",
    quantity: 2,
    totalPrice: { USD: 40, COP: 160000 },
    paymentMethod: "Cash",
    timestamp: new Date("2024-03-15T12:00:00Z"),
    waiterName: "Ana",
  },
  {
    id: "TEST-TXN-2",
    locationId: "TEST-LOC-3",
    itemId: "TEST-ITEM-2",
    quantity: 3,
    totalPrice: { USD: 15, COP: 36000 },
    paymentMethod: "Credit card",
    timestamp: new Date("2024-03-16T18:00:00Z"),
    waiterName: "Alex",
  },
  {
    id: "TEST-TXN-3",
    locationId: "TEST-LOC-1",
    itemId: "TEST-ITEM-3",
    quantity: 4,
    totalPrice: { USD: 12, COP: 64000 },
    paymentMethod: "Digital wallet",
    timestamp: new Date("2024-04-02T13:00:00Z"),
    waiterName: "Ana",
  },
];

assert.strictEqual(
  findLocationById(locations, "TEST-LOC-3"),
  locations[2],
  "findLocationById debe devolver la ubicacion con el ID existente",
);
assert.strictEqual(
  findLocationById(locations, "TEST-LOC-MISSING"),
  null,
  "findLocationById debe devolver null cuando el ID no existe",
);

const sortedLocations = [locations[1], locations[3], locations[0], locations[2]];
assert.strictEqual(
  binarySearchLocationByCapacity(sortedLocations, 80),
  2,
  "binarySearchLocationByCapacity debe encontrar la capacidad 80 en el indice 2",
);
assert.strictEqual(
  binarySearchLocationByCapacity(sortedLocations, 75),
  -1,
  "binarySearchLocationByCapacity debe devolver -1 para una capacidad inexistente",
);

assert.deepStrictEqual(
  filterActiveLocations(locations),
  [locations[0], locations[2]],
  "filterActiveLocations debe incluir todas y solo las ubicaciones Active",
);
assert.deepStrictEqual(
  filterMenuItemsByCategory(menuItems, "Side"),
  [menuItems[1]],
  "filterMenuItemsByCategory debe devolver solo los items de la categoria Side",
);

const originalLocationOrder = locations.map((location) => location.id);
assert.deepStrictEqual(
  sortLocationsByCapacity(locations, "asc").map((location) => location.seatingCapacity),
  [40, 60, 80, 100],
  "sortLocationsByCapacity debe ordenar las capacidades de menor a mayor",
);
assert.deepStrictEqual(
  locations.map((location) => location.id),
  originalLocationOrder,
  "sortLocationsByCapacity en asc no debe modificar el orden original",
);
assert.deepStrictEqual(
  sortLocationsByCapacity(locations, "desc").map((location) => location.seatingCapacity),
  [100, 80, 60, 40],
  "sortLocationsByCapacity debe ordenar las capacidades de mayor a menor",
);
assert.deepStrictEqual(
  locations.map((location) => location.id),
  originalLocationOrder,
  "sortLocationsByCapacity en desc no debe modificar el orden original",
);

const originalMenuOrder = menuItems.map((item) => item.id);
for (const currency of ["USD", "COP"] as const) {
  assert.deepStrictEqual(
    sortMenuItemsByPrice(menuItems, currency, "asc").map((item) => item.basePrice[currency]),
    currency === "USD" ? [3, 5, 20] : [12000, 16000, 80000],
    `sortMenuItemsByPrice debe ordenar los precios en ${currency} de menor a mayor`,
  );
  assert.deepStrictEqual(
    menuItems.map((item) => item.id),
    originalMenuOrder,
    `sortMenuItemsByPrice en ${currency} asc no debe modificar el orden original`,
  );
  assert.deepStrictEqual(
    sortMenuItemsByPrice(menuItems, currency, "desc").map((item) => item.basePrice[currency]),
    currency === "USD" ? [20, 5, 3] : [80000, 16000, 12000],
    `sortMenuItemsByPrice debe ordenar los precios en ${currency} de mayor a menor`,
  );
  assert.deepStrictEqual(
    menuItems.map((item) => item.id),
    originalMenuOrder,
    `sortMenuItemsByPrice en ${currency} desc no debe modificar el orden original`,
  );
}

assert.deepStrictEqual(
  filterSalesByLocation(sales, "TEST-LOC-1"),
  [sales[0], sales[2]],
  "filterSalesByLocation debe incluir todas y solo las ventas de TEST-LOC-1",
);

assert.strictEqual(
  findMenuItemByName(menuItems, "cArNe A La PaRrIlLa"),
  menuItems[0],
  "findMenuItemByName debe ignorar mayúsculas y minúsculas",
);
assert.strictEqual(
  findMenuItemByName(menuItems, "Producto inexistente"),
  null,
  "findMenuItemByName debe devolver null si el nombre no existe",
);
assert.deepStrictEqual(
  filterSalesByDateRange(sales, sales[0].timestamp, sales[1].timestamp),
  [sales[0], sales[1]],
  "filterSalesByDateRange debe incluir las fechas de inicio y fin",
);

const wasteRecords: WasteRecord[] = [
  {
    id: "TEST-WASTE-1",
    locationId: "TEST-LOC-1",
    itemId: "TEST-ITEM-1",
    quantity: 1,
    reason: "Expired",
    cost: { USD: 6, COP: 24000 },
    timestamp: new Date("2024-03-14T08:00:00Z"),
    reportedBy: "Ana",
  },
  {
    id: "TEST-WASTE-2",
    locationId: "TEST-LOC-1",
    itemId: "TEST-ITEM-2",
    quantity: 2,
    reason: "Damage",
    cost: { USD: 2, COP: 8000 },
    timestamp: new Date("2024-03-15T08:00:00Z"),
    reportedBy: "Ana",
  },
  {
    id: "TEST-WASTE-3",
    locationId: "TEST-LOC-3",
    itemId: "TEST-ITEM-2",
    quantity: 1,
    reason: "Cooking error",
    cost: { USD: 3, COP: 12000 },
    timestamp: new Date("2024-03-16T08:00:00Z"),
    reportedBy: "Alex",
  },
];

assert.strictEqual(
  calculateDailyRevenue(sales, new Date("2024-03-15T12:00:00Z"), "USD", "America/Bogota"),
  40,
  "calculateDailyRevenue debe sumar los ingresos del día en la zona indicada",
);
assert.strictEqual(
  calculateLocationMargin(sales, menuItems, "TEST-LOC-1", "USD"),
  61.54,
  "calculateLocationMargin debe calcular el margen sobre los ingresos y costos de ingredientes",
);
assert.strictEqual(
  calculateWasteCost(wasteRecords, "TEST-LOC-1", "USD"),
  8,
  "calculateWasteCost debe sumar el costo de desperdicio de la ubicación",
);
assert.strictEqual(convertCurrency(1, "USD", "COP"), 4000, "convertCurrency debe convertir USD a COP");
assert.strictEqual(convertCurrency(4000, "COP", "USD"), 1, "convertCurrency debe convertir COP a USD");
assert.strictEqual(convertCurrency(25, "USD", "USD"), 25, "convertCurrency debe conservar el valor en la misma moneda");

const referenceDate = new Date("2024-12-31T00:00:00Z");
assert.strictEqual(
  scoreLocationPerformance(locations[0], [], [], [], referenceDate),
  20,
  "scoreLocationPerformance debe devolver el puntaje base cuando no hay ventas ni desperdicio",
);
assert.deepStrictEqual(
  rankLocationsByPerformance([locations[0]], [], [], [], referenceDate),
  [{ location: locations[0], score: 20 }],
  "rankLocationsByPerformance debe ordenar y devolver el puntaje de cada ubicación",
);
assert.deepStrictEqual(
  countSalesByPaymentMethod(sales),
  { Cash: 1, "Credit card": 1, "Debit card": 0, "Digital wallet": 1 },
  "countSalesByPaymentMethod debe contar las ventas por método de pago",
);
assert.strictEqual(
  calculateAverageTicket(sales, "USD"),
  22.33,
  "calculateAverageTicket debe promediar los valores de los tickets",
);
assert.deepStrictEqual(
  findTopSellingItems(sales, menuItems, 2),
  [
    { item: menuItems[2], totalSold: 4 },
    { item: menuItems[1], totalSold: 3 },
  ],
  "findTopSellingItems debe devolver los artículos más vendidos en orden descendente",
);
assert.deepStrictEqual(
  groupWasteByReason(wasteRecords),
  {
    Expired: [wasteRecords[0]],
    "Cooking error": [wasteRecords[2]],
    "Customer return": [],
    Damage: [wasteRecords[1]],
    Other: [],
  },
  "groupWasteByReason debe agrupar los registros en las cinco razones",
);
assert.deepStrictEqual(
  calculateCountryComparison(sales, locations, menuItems),
  {
    Colombia: {
      totalLocations: 2,
      totalRevenue: { USD: 52, COP: 224000 },
      averageRevenuePerLocation: { USD: 26, COP: 112000 },
      totalSales: 2,
    },
    USA: {
      totalLocations: 2,
      totalRevenue: { USD: 15, COP: 36000 },
      averageRevenuePerLocation: { USD: 7.5, COP: 18000 },
      totalSales: 1,
    },
  },
  "calculateCountryComparison debe calcular ventas e ingresos por país",
);
assert.deepStrictEqual(
  findExtremeSales(sales, "USD"),
  { highest: sales[0], lowest: sales[2] },
  "findExtremeSales debe devolver la venta de mayor y menor valor",
);
assert.deepStrictEqual(
  findExtremeLocationRevenue(sales, [locations[0], locations[2]], "USD"),
  {
    highest: { location: locations[0], revenue: 52 },
    lowest: { location: locations[2], revenue: 15 },
  },
  "findExtremeLocationRevenue debe devolver las ubicaciones de mayor y menor ingreso",
);
assert.strictEqual(getTimeZoneByCountry("Colombia"), "America/Bogota", "getTimeZoneByCountry debe devolver la zona de Colombia");

const medellinSale = {
  ...sales[0],
  id: "TEST-TXN-MEDELLIN",
  locationId: "LOC-MEDELLIN-01",
  timestamp: new Date("2024-03-15T21:30:00-05:00"),
};
assert.strictEqual(
  calculateDailyRevenue(
    [medellinSale],
    new Date("2024-03-15T12:00:00-05:00"),
    "USD",
    "America/Bogota",
  ),
  40,
  "calculateDailyRevenue debe contar la venta de Medellín en el 15 de marzo de Bogotá",
);
assert.deepStrictEqual(
  findTopSellingItems(sales, menuItems, 0),
  [],
  "findTopSellingItems debe devolver un array vacío cuando topN es 0",
);

assert.strictEqual(findLocationById([], "TEST-LOC-1"), null, "findLocationById debe devolver null para un array vacío");
assert.deepStrictEqual(filterActiveLocations([]), [], "filterActiveLocations debe devolver un array vacío sin ubicaciones");
assert.strictEqual(calculateAverageTicket([], "USD"), 0, "calculateAverageTicket debe devolver 0 para un array vacío");

assert.deepStrictEqual(filterSalesByLocation(null, "TEST-LOC-1"), [], "filterSalesByLocation debe aceptar ventas nulas");
assert.strictEqual(findLocationById(null, "TEST-LOC-1"), null, "findLocationById debe aceptar ubicaciones nulas");
assert.strictEqual(
  calculateDailyRevenue(null, new Date("2024-03-15T12:00:00Z"), "USD", "America/Bogota"),
  0,
  "calculateDailyRevenue debe devolver 0 si las ventas son nulas",
);
assert.deepStrictEqual(
  validateMenuItem(null),
  { valid: false, errors: ["El ítem de menú no puede estar vacío."] },
  "validateMenuItem debe devolver un error cuando el ítem es null",
);

assert.strictEqual(validateMenuItem(menuItems[0]).valid, true, "validateMenuItem debe aceptar un ítem válido");
assert.strictEqual(
  validateMenuItem({ ...menuItems[0], prepTimeMinutes: 61 }).valid,
  false,
  "validateMenuItem debe rechazar un tiempo de preparación fuera de rango",
);
assert.strictEqual(validateSaleTransaction(sales[0]).valid, true, "validateSaleTransaction debe aceptar una venta válida");
assert.strictEqual(
  validateSaleTransaction({ ...sales[0], quantity: 0 }).valid,
  false,
  "validateSaleTransaction debe rechazar una cantidad no positiva",
);
assert.strictEqual(validateLocation(locations[0], 2026).valid, true, "validateLocation debe aceptar una ubicación válida para 2026");
assert.strictEqual(
  validateLocation({ ...locations[0], openingYear: 2007 }, 2026).valid,
  false,
  "validateLocation debe rechazar un año de apertura anterior a 2008",
);

console.log("✓ Todas las pruebas pasaron correctamente.");