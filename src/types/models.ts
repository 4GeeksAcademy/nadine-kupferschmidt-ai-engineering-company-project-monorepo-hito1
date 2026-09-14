interface Price {
  USD: number;
  COP: number;
}

type MenuCategory = "Meat" | "Side" | "Beverage" | "Dessert" | "Combo";
type MenuItemStatus = "Active" | "Seasonal" | "Discontinued";

interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  basePrice: Price;
  ingredientCost: Price;
  prepTimeMinutes: number;
  isAvailableInColombia: boolean;
  isAvailableInUSA: boolean;
  allergens: string[];
  status: MenuItemStatus;
}

type PaymentMethod = "Cash" | "Credit card" | "Debit card" | "Digital wallet";

interface SaleTransaction {
  id: string;
  locationId: string;
  itemId: string;
  quantity: number;
  totalPrice: Price;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  waiterName: string;
}

type Country = "Colombia" | "USA";
type LocationStatus = "Active" | "Temporarily closed" | "Under renovation";

interface Location {
  id: string;
  name: string;
  city: string;
  country: Country;
  openingYear: number;
  seatingCapacity: number;
  staffCount: number;
  monthlyRentCost: Price;
  averageMonthlyUtilities: Price;
  manager: string;
  status: LocationStatus;
}

type WasteReason = "Expired" | "Cooking error" | "Customer return" | "Damage" | "Other";

interface WasteRecord {
  id: string;
  locationId: string;
  itemId: string;
  quantity: number;
  reason: WasteReason;
  cost: Price;
  timestamp: Date;
  reportedBy: string;
}

export {
  Price,
  MenuCategory,
  MenuItemStatus,
  MenuItem,
  PaymentMethod,
  SaleTransaction,
  Country,
  LocationStatus,
  Location,
  WasteReason,
  WasteRecord,
};