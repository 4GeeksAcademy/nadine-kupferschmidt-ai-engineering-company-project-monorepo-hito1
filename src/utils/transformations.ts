import {
  SaleTransaction,
  MenuItem,
  Location,
  WasteRecord,
  PaymentMethod,
  WasteReason,
  Price,
  Country,
} from "../types/models";

const USD_TO_COP_RATE = 4000;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getTimeZoneByCountry(country: Country): string {
  return country === "Colombia" ? "America/Bogota" : "America/New_York";
}

function isSameCalendarDay(a: Date, b: Date, timeZone: string): boolean {
  return (
    a.toLocaleDateString("en-CA", { timeZone }) ===
    b.toLocaleDateString("en-CA", { timeZone })
  );
}

function filterSalesByLocationLocal(sales: SaleTransaction[] | null, locationId: string): SaleTransaction[] {
  if (sales === null) return [];
  return sales.filter((sale) => sale.locationId === locationId);
}

function calculateDailyRevenue(
  sales: SaleTransaction[] | null,
  date: Date | null,
  currency: "USD" | "COP",
  timeZone: string
): number {
  if (sales === null || date === null) return 0;
  const dailySales = sales.filter((sale) => isSameCalendarDay(sale.timestamp, date, timeZone));
  const total = dailySales.reduce((sum, sale) => sum + sale.totalPrice[currency], 0);
  return round2(total);
}

function calculateLocationMargin(
  sales: SaleTransaction[] | null,
  menuItems: MenuItem[] | null,
  locationId: string,
  currency: "USD" | "COP"
): number {
  if (sales === null || menuItems === null) return 0;
  const locationSales = filterSalesByLocationLocal(sales, locationId);

  let totalRevenue = 0;
  let totalIngredientCost = 0;

  for (const sale of locationSales) {
    totalRevenue += sale.totalPrice[currency];
    const menuItem = menuItems.find((item) => item.id === sale.itemId);
    if (menuItem) {
      totalIngredientCost += menuItem.ingredientCost[currency] * sale.quantity;
    }
  }

  if (totalRevenue === 0) return 0;

  const margin = ((totalRevenue - totalIngredientCost) / totalRevenue) * 100;
  return round2(margin);
}

function calculateWasteCost(
  wasteRecords: WasteRecord[] | null,
  locationId: string,
  currency: "USD" | "COP"
): number {
  if (wasteRecords === null) return 0;
  const total = wasteRecords
    .filter((record) => record.locationId === locationId)
    .reduce((sum, record) => sum + record.cost[currency], 0);
  return round2(total);
}

function convertCurrency(
  amount: number,
  fromCurrency: "USD" | "COP",
  toCurrency: "USD" | "COP"
): number {
  if (fromCurrency === toCurrency) return amount;
  const result =
    fromCurrency === "USD" ? amount * USD_TO_COP_RATE : amount / USD_TO_COP_RATE;
  return round2(result);
}

function scoreLocationPerformance(
  location: Location | null,
  sales: SaleTransaction[] | null,
  wasteRecords: WasteRecord[] | null,
  menuItems: MenuItem[] | null,
  referenceDate: Date
): number {
  if (location === null) return 0;
  const safeSales = sales ?? [];
  const safeWasteRecords = wasteRecords ?? [];
  const safeMenuItems = menuItems ?? [];
  const locationSales = filterSalesByLocationLocal(safeSales, location.id);
  const locationWaste = safeWasteRecords.filter((w) => w.locationId === location.id);

  const openingDate = new Date(location.openingYear, 0, 1);
  const daysOperating = Math.max(
    1,
    Math.floor((referenceDate.getTime() - openingDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const totalRevenueUSD = locationSales.reduce((sum, s) => sum + s.totalPrice.USD, 0);
  const avgDailyRevenueUSD = totalRevenueUSD / daysOperating;
  const revenueScore = Math.min((avgDailyRevenueUSD / 1000) * 40, 40);

  const efficiencyScore = Math.min((locationSales.length / location.seatingCapacity) * 30, 30);

  const totalWasteCostUSD = locationWaste.reduce((sum, w) => sum + w.cost.USD, 0);
  const wastePercentage = totalRevenueUSD > 0 ? (totalWasteCostUSD / totalRevenueUSD) * 100 : 0;
  const wasteScore = Math.max(20 - wastePercentage * 2, 0);

  const margin = calculateLocationMargin(safeSales, safeMenuItems, location.id, "USD");
  const marginScore = Math.min(margin / 10, 10);

  return round2(revenueScore + efficiencyScore + wasteScore + marginScore);
}

function rankLocationsByPerformance(
  locations: Location[] | null,
  sales: SaleTransaction[] | null,
  wasteRecords: WasteRecord[] | null,
  menuItems: MenuItem[] | null,
  referenceDate: Date
): Array<{ location: Location; score: number }> {
  if (locations === null) return [];
  const safeSales = sales ?? [];
  const safeWasteRecords = wasteRecords ?? [];
  const safeMenuItems = menuItems ?? [];
  return locations
    .map((location) => ({
      location,
      score: scoreLocationPerformance(location, safeSales, safeWasteRecords, safeMenuItems, referenceDate),
    }))
    .sort((a, b) => b.score - a.score);
}

function countSalesByPaymentMethod(sales: SaleTransaction[] | null): Record<PaymentMethod, number> {
  if (sales === null) {
    return {
      Cash: 0,
      "Credit card": 0,
      "Debit card": 0,
      "Digital wallet": 0,
    };
  }
  const counts: Record<PaymentMethod, number> = {
    Cash: 0,
    "Credit card": 0,
    "Debit card": 0,
    "Digital wallet": 0,
  };
  for (const sale of sales) {
    counts[sale.paymentMethod] += 1;
  }
  return counts;
}

function calculateAverageTicket(sales: SaleTransaction[] | null, currency: "USD" | "COP"): number {
  if (sales === null) return 0;
  if (sales.length === 0) return 0;
  const total = sales.reduce((sum, sale) => sum + sale.totalPrice[currency], 0);
  return round2(total / sales.length);
}

function findTopSellingItems(
  sales: SaleTransaction[] | null,
  menuItems: MenuItem[] | null,
  topN: number
): Array<{ item: MenuItem; totalSold: number }> {
  if (sales === null || menuItems === null || topN <= 0) return [];
  const quantityByItemId: Record<string, number> = {};
  for (const sale of sales) {
    quantityByItemId[sale.itemId] = (quantityByItemId[sale.itemId] ?? 0) + sale.quantity;
  }

  const result: Array<{ item: MenuItem; totalSold: number }> = [];
  for (const itemId in quantityByItemId) {
    const menuItem = menuItems.find((item) => item.id === itemId);
    if (menuItem) {
      result.push({ item: menuItem, totalSold: quantityByItemId[itemId] });
    }
  }

  return result.sort((a, b) => b.totalSold - a.totalSold).slice(0, topN);
}

function groupWasteByReason(wasteRecords: WasteRecord[] | null): Record<WasteReason, WasteRecord[]> {
  if (wasteRecords === null) {
    return {
      Expired: [],
      "Cooking error": [],
      "Customer return": [],
      Damage: [],
      Other: [],
    };
  }
  const groups: Record<WasteReason, WasteRecord[]> = {
    Expired: [],
    "Cooking error": [],
    "Customer return": [],
    Damage: [],
    Other: [],
  };
  for (const record of wasteRecords) {
    groups[record.reason].push(record);
  }
  return groups;
}

interface CountryMetrics {
  totalLocations: number;
  totalRevenue: Price;
  averageRevenuePerLocation: Price;
  totalSales: number;
}

function calculateCountryComparison(
  sales: SaleTransaction[] | null,
  locations: Location[] | null,
  menuItems: MenuItem[] | null
): { Colombia: CountryMetrics; USA: CountryMetrics } {
  const safeSales = sales ?? [];
  const safeLocations = locations ?? [];
  function metricsFor(country: "Colombia" | "USA"): CountryMetrics {
    const countryLocations = safeLocations.filter((loc) => loc.country === country);
    const locationIds = countryLocations.map((loc) => loc.id);
    const countrySales = safeSales.filter((sale) => locationIds.includes(sale.locationId));

    const totalRevenue: Price = {
      USD: round2(countrySales.reduce((sum, s) => sum + s.totalPrice.USD, 0)),
      COP: round2(countrySales.reduce((sum, s) => sum + s.totalPrice.COP, 0)),
    };

    const totalLocations = countryLocations.length;
    const averageRevenuePerLocation: Price = {
      USD: totalLocations > 0 ? round2(totalRevenue.USD / totalLocations) : 0,
      COP: totalLocations > 0 ? round2(totalRevenue.COP / totalLocations) : 0,
    };

    return {
      totalLocations,
      totalRevenue,
      averageRevenuePerLocation,
      totalSales: countrySales.length,
    };
  }

  return {
    Colombia: metricsFor("Colombia"),
    USA: metricsFor("USA"),
  };
}

function findExtremeSales(
  sales: SaleTransaction[] | null,
  currency: "USD" | "COP"
): { highest: SaleTransaction | null; lowest: SaleTransaction | null } {
  if (sales === null) return { highest: null, lowest: null };
  if (sales.length === 0) return { highest: null, lowest: null };

  let highest = sales[0];
  let lowest = sales[0];

  for (const sale of sales) {
    if (sale.totalPrice[currency] > highest.totalPrice[currency]) highest = sale;
    if (sale.totalPrice[currency] < lowest.totalPrice[currency]) lowest = sale;
  }

  return { highest, lowest };
}

function findExtremeLocationRevenue(
  sales: SaleTransaction[] | null,
  locations: Location[] | null,
  currency: "USD" | "COP"
): { highest: { location: Location; revenue: number } | null; lowest: { location: Location; revenue: number } | null } {
  if (locations === null) return { highest: null, lowest: null };
  const safeSales = sales ?? [];
  if (locations.length === 0) return { highest: null, lowest: null };

  const revenueByLocation = locations.map((location) => {
    const locationSales = filterSalesByLocationLocal(safeSales, location.id);
    const revenue = round2(locationSales.reduce((sum, s) => sum + s.totalPrice[currency], 0));
    return { location, revenue };
  });

  let highest = revenueByLocation[0];
  let lowest = revenueByLocation[0];

  for (const entry of revenueByLocation) {
    if (entry.revenue > highest.revenue) highest = entry;
    if (entry.revenue < lowest.revenue) lowest = entry;
  }

  return { highest, lowest };
}

export {
  calculateDailyRevenue,
  getTimeZoneByCountry,
  calculateLocationMargin,
  calculateWasteCost,
  convertCurrency,
  scoreLocationPerformance,
  rankLocationsByPerformance,
  countSalesByPaymentMethod,
  calculateAverageTicket,
  findTopSellingItems,
  groupWasteByReason,
  calculateCountryComparison,
  findExtremeSales,
  findExtremeLocationRevenue,
  CountryMetrics,
};