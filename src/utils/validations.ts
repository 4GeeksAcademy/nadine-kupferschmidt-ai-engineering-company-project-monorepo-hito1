import { MenuItem, SaleTransaction, Location } from "../types/models";

function validateMenuItem(item: MenuItem): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (item.basePrice.USD <= 0 || item.basePrice.COP <= 0) {
    errors.push("El precio base (USD y COP) debe ser mayor a 0.");
  }
  if (item.prepTimeMinutes <= 0 || item.prepTimeMinutes > 60) {
    errors.push("El tiempo de preparación debe estar entre 1 y 60 minutos.");
  }
  if (item.name.trim() === "") {
    errors.push("El nombre del ítem no puede estar vacío.");
  }
  if (!item.isAvailableInColombia && !item.isAvailableInUSA) {
    errors.push("El ítem debe estar disponible en al menos un país.");
  }

  return { valid: errors.length === 0, errors };
}

function validateSaleTransaction(sale: SaleTransaction): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (sale.quantity <= 0) {
    errors.push("La cantidad debe ser mayor a 0.");
  }
  if (sale.totalPrice.USD <= 0 || sale.totalPrice.COP <= 0) {
    errors.push("El precio total (USD y COP) debe ser mayor a 0.");
  }
  if (sale.waiterName.trim() === "") {
    errors.push("El nombre del mesero no puede estar vacío.");
  }

  return { valid: errors.length === 0, errors };
}

function validateLocation(location: Location): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (location.openingYear < 2008 || location.openingYear > currentYear) {
    errors.push(`El año de apertura debe estar entre 2008 y ${currentYear}.`);
  }
  if (location.seatingCapacity <= 0) {
    errors.push("La capacidad de asientos debe ser mayor a 0.");
  }
  if (location.staffCount <= 0) {
    errors.push("El número de empleados debe ser mayor a 0.");
  }
  if (location.monthlyRentCost.USD <= 0 || location.monthlyRentCost.COP <= 0) {
    errors.push("El costo de renta mensual (USD y COP) debe ser mayor a 0.");
  }
  if (location.averageMonthlyUtilities.USD <= 0 || location.averageMonthlyUtilities.COP <= 0) {
    errors.push("El costo de servicios mensuales (USD y COP) debe ser mayor a 0.");
  }

  return { valid: errors.length === 0, errors };
}

export { validateMenuItem, validateSaleTransaction, validateLocation };