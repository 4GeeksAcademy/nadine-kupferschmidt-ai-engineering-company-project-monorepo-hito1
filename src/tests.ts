import * as assert from "node:assert/strict";
import type { Location, MenuItem, SaleTransaction } from "./types/models";
import { findLocationById, binarySearchLocationByCapacity } from "./utils/search";
import {
  filterActiveLocations,
  filterMenuItemsByCategory,
  sortLocationsByCapacity,
  sortMenuItemsByPrice,
  filterSalesByLocation,
} from "./utils/collections";

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

console.log("✓ Todas las pruebas pasaron correctamente.");