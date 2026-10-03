import { SaleTransaction, MenuItem, Location, MenuCategory } from "../types/models";

function filterSalesByLocation(sales: SaleTransaction[], locationId: string): SaleTransaction[] {
  return sales.filter((sale) => sale.locationId === locationId);
}

function filterSalesByDateRange(
  sales: SaleTransaction[],
  startDate: Date,
  endDate: Date
): SaleTransaction[] {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return sales.filter((sale) => {
    const time = sale.timestamp.getTime();
    return time >= start && time <= end;
  });
}

function filterMenuItemsByCategory(items: MenuItem[], category: MenuCategory): MenuItem[] {
  return items.filter((item) => item.category === category);
}

function filterActiveLocations(locations: Location[]): Location[] {
  return locations.filter((location) => location.status === "Active");
}

function sortLocationsByCapacity(locations: Location[], order: "asc" | "desc"): Location[] {
  return [...locations].sort((a, b) =>
    order === "asc" ? a.seatingCapacity - b.seatingCapacity : b.seatingCapacity - a.seatingCapacity
  );
}

function sortMenuItemsByPrice(
  items: MenuItem[],
  currency: "USD" | "COP",
  order: "asc" | "desc"
): MenuItem[] {
  return [...items].sort((a, b) =>
    order === "asc"
      ? a.basePrice[currency] - b.basePrice[currency]
      : b.basePrice[currency] - a.basePrice[currency]
  );
}

export {
  filterSalesByLocation,
  filterSalesByDateRange,
  filterMenuItemsByCategory,
  filterActiveLocations,
  sortLocationsByCapacity,
  sortMenuItemsByPrice,
};