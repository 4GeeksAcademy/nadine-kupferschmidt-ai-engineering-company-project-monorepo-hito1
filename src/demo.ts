import { MenuItem, Location, SaleTransaction } from "./types/models";
import { findLocationById, binarySearchLocationByCapacity } from "./utils/search";
import { sortLocationsByCapacity, filterActiveLocations } from "./utils/collections";
import {
  calculateLocationMargin,
  scoreLocationPerformance,
  rankLocationsByPerformance,
  countSalesByPaymentMethod,
  calculateCountryComparison,
} from "./utils/transformations";
import { validateMenuItem, validateSaleTransaction, validateLocation } from "./utils/validations";

const sampleMenuItems: MenuItem[] = [
  {
    id: "ITEM-PICANHA-250",
    name: "Picanha 250g",
    category: "Meat",
    basePrice: { USD: 18.5, COP: 74000 },
    ingredientCost: { USD: 7.2, COP: 28800 },
    prepTimeMinutes: 15,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-FRIES",
    name: "Papas Fritas",
    category: "Side",
    basePrice: { USD: 4.5, COP: 18000 },
    ingredientCost: { USD: 1.2, COP: 4800 },
    prepTimeMinutes: 8,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
];

const sampleLocations: Location[] = [
  {
    id: "LOC-MEDELLIN-01",
    name: "Brasaland Medellín Centro",
    city: "Medellín",
    country: "Colombia",
    openingYear: 2008,
    seatingCapacity: 80,
    staffCount: 12,
    monthlyRentCost: { USD: 1500, COP: 6000000 },
    averageMonthlyUtilities: { USD: 400, COP: 1600000 },
    manager: "Carlos Jiménez",
    status: "Active",
  },
  {
    id: "LOC-MIAMI-01",
    name: "Brasaland Miami Beach",
    city: "Miami",
    country: "USA",
    openingYear: 2018,
    seatingCapacity: 100,
    staffCount: 15,
    monthlyRentCost: { USD: 5500, COP: 22000000 },
    averageMonthlyUtilities: { USD: 800, COP: 3200000 },
    manager: "Jake Morrison",
    status: "Active",
  },
];

const sampleSales: SaleTransaction[] = [
  {
    id: "TXN-2024-15482",
    locationId: "LOC-MEDELLIN-01",
    itemId: "ITEM-PICANHA-250",
    quantity: 2,
    totalPrice: { USD: 37.0, COP: 148000 },
    paymentMethod: "Credit card",
    timestamp: new Date("2024-03-15T19:30:00"),
    waiterName: "María González",
  },
  {
    id: "TXN-2024-15483",
    locationId: "LOC-MIAMI-01",
    itemId: "ITEM-FRIES",
    quantity: 3,
    totalPrice: { USD: 13.5, COP: 54000 },
    paymentMethod: "Cash",
    timestamp: new Date("2024-03-15T20:15:00"),
    waiterName: "John Smith",
  },
];

console.log("--- findLocationById ---");
console.log(findLocationById(sampleLocations, "LOC-MEDELLIN-01"));

console.log("--- sortLocationsByCapacity (asc) ---");
const sorted = sortLocationsByCapacity(sampleLocations, "asc");
console.log(sorted.map((l) => `${l.name}: ${l.seatingCapacity}`));

console.log("--- binarySearchLocationByCapacity (buscar 100) ---");
console.log(binarySearchLocationByCapacity(sorted, 100));

console.log("--- calculateLocationMargin (LOC-MEDELLIN-01, USD) ---");
console.log(calculateLocationMargin(sampleSales, sampleMenuItems, "LOC-MEDELLIN-01", "USD"));

console.log("--- scoreLocationPerformance (Medellín) ---");
console.log(scoreLocationPerformance(sampleLocations[0], sampleSales, [], sampleMenuItems));

console.log("--- rankLocationsByPerformance ---");
console.log(rankLocationsByPerformance(sampleLocations, sampleSales, [], sampleMenuItems));

console.log("--- countSalesByPaymentMethod ---");
console.log(countSalesByPaymentMethod(sampleSales));

console.log("--- calculateCountryComparison ---");
console.log(JSON.stringify(calculateCountryComparison(sampleSales, sampleLocations, sampleMenuItems), null, 2));

console.log("--- validateMenuItem (válido) ---");
console.log(validateMenuItem(sampleMenuItems[0]));

console.log("--- validateLocation (válido) ---");
console.log(validateLocation(sampleLocations[0]));

console.log("\n=== PRUEBAS DE VALIDACIÓN (casos inválidos) ===");

console.log("--- validateMenuItem: precio negativo ---");
console.log(validateMenuItem({ ...sampleMenuItems[0], basePrice: { USD: -5, COP: 74000 } }));

console.log("--- validateMenuItem: tiempo de preparación fuera de rango ---");
console.log(validateMenuItem({ ...sampleMenuItems[0], prepTimeMinutes: 90 }));

console.log("--- validateMenuItem: nombre vacío ---");
console.log(validateMenuItem({ ...sampleMenuItems[0], name: "" }));

console.log("--- validateMenuItem: no disponible en ningún país ---");
console.log(validateMenuItem({ ...sampleMenuItems[0], isAvailableInColombia: false, isAvailableInUSA: false }));

console.log("--- validateMenuItem: MÚLTIPLES errores a la vez ---");
console.log(validateMenuItem({ ...sampleMenuItems[0], basePrice: { USD: 0, COP: 0 }, name: "", prepTimeMinutes: 0 }));

console.log("--- validateSaleTransaction: cantidad inválida ---");
console.log(validateSaleTransaction({ ...sampleSales[0], quantity: 0 }));

console.log("--- validateSaleTransaction: mesero vacío ---");
console.log(validateSaleTransaction({ ...sampleSales[0], waiterName: "" }));

console.log("--- validateLocation: año de apertura fuera de rango ---");
console.log(validateLocation({ ...sampleLocations[0], openingYear: 1999 }));

console.log("--- validateLocation: capacidad de asientos inválida ---");
console.log(validateLocation({ ...sampleLocations[0], seatingCapacity: 0 }));