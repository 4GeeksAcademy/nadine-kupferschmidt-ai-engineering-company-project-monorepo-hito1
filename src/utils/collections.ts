import { SaleTransaction, MenuItem, Location, MenuCategory } from "../types/models";

function filterSalesByLocation(sales: SaleTransaction[] | null, locationId: string): SaleTransaction[] {
  if (sales === null) return [];
  return sales.filter((sale) => sale.locationId === locationId);
}

function filterSalesByDateRange(
  sales: SaleTransaction[] | null,
  startDate: Date | null,
  endDate: Date | null
): SaleTransaction[] {
  if (sales === null) return [];
  if (startDate === null || endDate === null) return [];
  const start = startDate.getTime();
  const end = endDate.getTime();
  return sales.filter((sale) => {
    const time = sale.timestamp.getTime();
    return time >= start && time <= end;
  });
}

function filterMenuItemsByCategory(items: MenuItem[] | null, category: MenuCategory): MenuItem[] {
  if (items === null) return [];
  return items.filter((item) => item.category === category);
}

function filterActiveLocations(locations: Location[] | null): Location[] {
  if (locations === null) return [];
  return locations.filter((location) => location.status === "Active");
}

function sortLocationsByCapacity(locations: Location[] | null, order: "asc" | "desc"): Location[] {
  if (locations === null) return [];
  return [...locations].sort((a, b) =>
    order === "asc" ? a.seatingCapacity - b.seatingCapacity : b.seatingCapacity - a.seatingCapacity
  );
}

function sortMenuItemsByPrice(
  items: MenuItem[] | null,
  currency: "USD" | "COP",
  order: "asc" | "desc"
): MenuItem[] {
  if (items === null) return [];
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