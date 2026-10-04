import { MenuItem, Location, SaleTransaction } from "./types/models";
import { findLocationById, binarySearchLocationByCapacity } from "./utils/search";
import {
  sortLocationsByCapacity,
  filterActiveLocations,
  filterMenuItemsByCategory,
  sortMenuItemsByPrice,
} from "./utils/collections";
import {
  calculateLocationMargin,
  rankLocationsByPerformance,
  countSalesByPaymentMethod,
  findExtremeSales,
  findExtremeLocationRevenue,
  findTopSellingItems,
} from "./utils/transformations";
import { validateMenuItem, validateSaleTransaction, validateLocation } from "./utils/validations";

export const sampleMenuItems: MenuItem[] = [
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

export const sampleLocations: Location[] = [
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

export const sampleSales: SaleTransaction[] = [
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

(window as any).Brasaland = {
  sampleMenuItems,
  sampleLocations,
  sampleSales,
  findLocationById,
  binarySearchLocationByCapacity,
  sortLocationsByCapacity,
  filterActiveLocations,
  filterMenuItemsByCategory,
  sortMenuItemsByPrice,
  calculateLocationMargin,
  rankLocationsByPerformance,
  countSalesByPaymentMethod,
  findExtremeSales,
  findExtremeLocationRevenue,
  findTopSellingItems,
  validateMenuItem,
  validateSaleTransaction,
  validateLocation,
};