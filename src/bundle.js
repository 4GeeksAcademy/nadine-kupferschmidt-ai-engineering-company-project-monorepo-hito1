"use strict";
(() => {
  // src/utils/search.ts
  function findLocationById(locations, id) {
    for (const location of locations) {
      if (location.id === id) return location;
    }
    return null;
  }
  function binarySearchLocationByCapacity(sortedLocations, targetCapacity) {
    let low = 0;
    let high = sortedLocations.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midCapacity = sortedLocations[mid].seatingCapacity;
      if (midCapacity === targetCapacity) {
        return mid;
      } else if (midCapacity < targetCapacity) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return -1;
  }

  // src/utils/collections.ts
  function filterMenuItemsByCategory(items, category) {
    return items.filter((item) => item.category === category);
  }
  function filterActiveLocations(locations) {
    return locations.filter((location) => location.status === "Active");
  }
  function sortLocationsByCapacity(locations, order) {
    return [...locations].sort(
      (a, b) => order === "asc" ? a.seatingCapacity - b.seatingCapacity : b.seatingCapacity - a.seatingCapacity
    );
  }
  function sortMenuItemsByPrice(items, currency, order) {
    return [...items].sort(
      (a, b) => order === "asc" ? a.basePrice[currency] - b.basePrice[currency] : b.basePrice[currency] - a.basePrice[currency]
    );
  }

  // src/utils/transformations.ts
  function round2(value) {
    return Math.round(value * 100) / 100;
  }
  function filterSalesByLocationLocal(sales, locationId) {
    return sales.filter((sale) => sale.locationId === locationId);
  }
  function calculateLocationMargin(sales, menuItems, locationId, currency) {
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
    const margin = (totalRevenue - totalIngredientCost) / totalRevenue * 100;
    return round2(margin);
  }
  function scoreLocationPerformance(location, sales, wasteRecords, menuItems) {
    const locationSales = filterSalesByLocationLocal(sales, location.id);
    const locationWaste = wasteRecords.filter((w) => w.locationId === location.id);
    const today = /* @__PURE__ */ new Date();
    const openingDate = new Date(location.openingYear, 0, 1);
    const daysOperating = Math.max(
      1,
      Math.floor((today.getTime() - openingDate.getTime()) / (1e3 * 60 * 60 * 24))
    );
    const totalRevenueUSD = locationSales.reduce((sum, s) => sum + s.totalPrice.USD, 0);
    const avgDailyRevenueUSD = totalRevenueUSD / daysOperating;
    const revenueScore = Math.min(avgDailyRevenueUSD / 1e3 * 40, 40);
    const efficiencyScore = Math.min(locationSales.length / location.seatingCapacity * 30, 30);
    const totalWasteCostUSD = locationWaste.reduce((sum, w) => sum + w.cost.USD, 0);
    const wastePercentage = totalRevenueUSD > 0 ? totalWasteCostUSD / totalRevenueUSD * 100 : 0;
    const wasteScore = Math.max(20 - wastePercentage * 2, 0);
    const margin = calculateLocationMargin(sales, menuItems, location.id, "USD");
    const marginScore = Math.min(margin / 10, 10);
    return round2(revenueScore + efficiencyScore + wasteScore + marginScore);
  }
  function rankLocationsByPerformance(locations, sales, wasteRecords, menuItems) {
    return locations.map((location) => ({
      location,
      score: scoreLocationPerformance(location, sales, wasteRecords, menuItems)
    })).sort((a, b) => b.score - a.score);
  }
  function countSalesByPaymentMethod(sales) {
    const counts = {
      Cash: 0,
      "Credit card": 0,
      "Debit card": 0,
      "Digital wallet": 0
    };
    for (const sale of sales) {
      counts[sale.paymentMethod] += 1;
    }
    return counts;
  }
  function findTopSellingItems(sales, menuItems, topN) {
    const quantityByItemId = {};
    for (const sale of sales) {
      quantityByItemId[sale.itemId] = (quantityByItemId[sale.itemId] ?? 0) + sale.quantity;
    }
    const result = [];
    for (const itemId in quantityByItemId) {
      const menuItem = menuItems.find((item) => item.id === itemId);
      if (menuItem) {
        result.push({ item: menuItem, totalSold: quantityByItemId[itemId] });
      }
    }
    return result.sort((a, b) => b.totalSold - a.totalSold).slice(0, topN);
  }
  function findExtremeSales(sales, currency) {
    if (sales.length === 0) return { highest: null, lowest: null };
    let highest = sales[0];
    let lowest = sales[0];
    for (const sale of sales) {
      if (sale.totalPrice[currency] > highest.totalPrice[currency]) highest = sale;
      if (sale.totalPrice[currency] < lowest.totalPrice[currency]) lowest = sale;
    }
    return { highest, lowest };
  }
  function findExtremeLocationRevenue(sales, locations, currency) {
    if (locations.length === 0) return { highest: null, lowest: null };
    const revenueByLocation = locations.map((location) => {
      const locationSales = filterSalesByLocationLocal(sales, location.id);
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

  // src/utils/validations.ts
  function validateMenuItem(item) {
    const errors = [];
    if (item.basePrice.USD <= 0 || item.basePrice.COP <= 0) {
      errors.push("El precio base (USD y COP) debe ser mayor a 0.");
    }
    if (item.prepTimeMinutes <= 0 || item.prepTimeMinutes > 60) {
      errors.push("El tiempo de preparaci\xF3n debe estar entre 1 y 60 minutos.");
    }
    if (item.name.trim() === "") {
      errors.push("El nombre del \xEDtem no puede estar vac\xEDo.");
    }
    if (!item.isAvailableInColombia && !item.isAvailableInUSA) {
      errors.push("El \xEDtem debe estar disponible en al menos un pa\xEDs.");
    }
    return { valid: errors.length === 0, errors };
  }
  function validateSaleTransaction(sale) {
    const errors = [];
    if (sale.quantity <= 0) {
      errors.push("La cantidad debe ser mayor a 0.");
    }
    if (sale.totalPrice.USD <= 0 || sale.totalPrice.COP <= 0) {
      errors.push("El precio total (USD y COP) debe ser mayor a 0.");
    }
    if (sale.waiterName.trim() === "") {
      errors.push("El nombre del mesero no puede estar vac\xEDo.");
    }
    return { valid: errors.length === 0, errors };
  }
  function validateLocation(location) {
    const errors = [];
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    if (location.openingYear < 2008 || location.openingYear > currentYear) {
      errors.push(`El a\xF1o de apertura debe estar entre 2008 y ${currentYear}.`);
    }
    if (location.seatingCapacity <= 0) {
      errors.push("La capacidad de asientos debe ser mayor a 0.");
    }
    if (location.staffCount <= 0) {
      errors.push("El n\xFAmero de empleados debe ser mayor a 0.");
    }
    if (location.monthlyRentCost.USD <= 0 || location.monthlyRentCost.COP <= 0) {
      errors.push("El costo de renta mensual (USD y COP) debe ser mayor a 0.");
    }
    if (location.averageMonthlyUtilities.USD <= 0 || location.averageMonthlyUtilities.COP <= 0) {
      errors.push("El costo de servicios mensuales (USD y COP) debe ser mayor a 0.");
    }
    return { valid: errors.length === 0, errors };
  }

  // src/browser-entry.ts
  var sampleMenuItems = [
    {
      id: "ITEM-PICANHA-250",
      name: "Picanha 250g",
      category: "Meat",
      basePrice: { USD: 18.5, COP: 74e3 },
      ingredientCost: { USD: 7.2, COP: 28800 },
      prepTimeMinutes: 15,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-FRIES",
      name: "Papas Fritas",
      category: "Side",
      basePrice: { USD: 4.5, COP: 18e3 },
      ingredientCost: { USD: 1.2, COP: 4800 },
      prepTimeMinutes: 8,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    }
  ];
  var sampleLocations = [
    {
      id: "LOC-MEDELLIN-01",
      name: "Brasaland Medell\xEDn Centro",
      city: "Medell\xEDn",
      country: "Colombia",
      openingYear: 2008,
      seatingCapacity: 80,
      staffCount: 12,
      monthlyRentCost: { USD: 1500, COP: 6e6 },
      averageMonthlyUtilities: { USD: 400, COP: 16e5 },
      manager: "Carlos Jim\xE9nez",
      status: "Active"
    },
    {
      id: "LOC-MIAMI-01",
      name: "Brasaland Miami Beach",
      city: "Miami",
      country: "USA",
      openingYear: 2018,
      seatingCapacity: 100,
      staffCount: 15,
      monthlyRentCost: { USD: 5500, COP: 22e6 },
      averageMonthlyUtilities: { USD: 800, COP: 32e5 },
      manager: "Jake Morrison",
      status: "Active"
    }
  ];
  var sampleSales = [
    {
      id: "TXN-2024-15482",
      locationId: "LOC-MEDELLIN-01",
      itemId: "ITEM-PICANHA-250",
      quantity: 2,
      totalPrice: { USD: 37, COP: 148e3 },
      paymentMethod: "Credit card",
      timestamp: /* @__PURE__ */ new Date("2024-03-15T19:30:00"),
      waiterName: "Mar\xEDa Gonz\xE1lez"
    },
    {
      id: "TXN-2024-15483",
      locationId: "LOC-MIAMI-01",
      itemId: "ITEM-FRIES",
      quantity: 3,
      totalPrice: { USD: 13.5, COP: 54e3 },
      paymentMethod: "Cash",
      timestamp: /* @__PURE__ */ new Date("2024-03-15T20:15:00"),
      waiterName: "John Smith"
    }
  ];
  window.Brasaland = {
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
    validateLocation
  };
})();
