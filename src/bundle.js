"use strict";
(() => {
  // src/utils/search.ts
  function findLocationById(locations, id) {
    for (const location of locations) {
      if (location.id === id) return location;
    }
    return null;
  }
  function findMenuItemByName(items, name) {
    const targetName = name.toLowerCase();
    for (const item of items) {
      if (item.name.toLowerCase() === targetName) return item;
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
  function filterSalesByDateRange(sales, startDate, endDate) {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return sales.filter((sale) => {
      const time = sale.timestamp.getTime();
      return time >= start && time <= end;
    });
  }
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
  var USD_TO_COP_RATE = 4e3;
  function round2(value) {
    return Math.round(value * 100) / 100;
  }
  function isSameCalendarDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function filterSalesByLocationLocal(sales, locationId) {
    return sales.filter((sale) => sale.locationId === locationId);
  }
  function calculateDailyRevenue(sales, date, currency) {
    const dailySales = sales.filter((sale) => isSameCalendarDay(sale.timestamp, date));
    const total = dailySales.reduce((sum, sale) => sum + sale.totalPrice[currency], 0);
    return round2(total);
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
  function calculateWasteCost(wasteRecords, locationId, currency) {
    const total = wasteRecords.filter((record) => record.locationId === locationId).reduce((sum, record) => sum + record.cost[currency], 0);
    return round2(total);
  }
  function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    const result = fromCurrency === "USD" ? amount * USD_TO_COP_RATE : amount / USD_TO_COP_RATE;
    return round2(result);
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
  function calculateAverageTicket(sales, currency) {
    if (sales.length === 0) return 0;
    const total = sales.reduce((sum, sale) => sum + sale.totalPrice[currency], 0);
    return round2(total / sales.length);
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
  function groupWasteByReason(wasteRecords) {
    const groups = {
      Expired: [],
      "Cooking error": [],
      "Customer return": [],
      Damage: [],
      Other: []
    };
    for (const record of wasteRecords) {
      groups[record.reason].push(record);
    }
    return groups;
  }
  function calculateCountryComparison(sales, locations, menuItems) {
    function metricsFor(country) {
      const countryLocations = locations.filter((loc) => loc.country === country);
      const locationIds = countryLocations.map((loc) => loc.id);
      const countrySales = sales.filter((sale) => locationIds.includes(sale.locationId));
      const totalRevenue = {
        USD: round2(countrySales.reduce((sum, s) => sum + s.totalPrice.USD, 0)),
        COP: round2(countrySales.reduce((sum, s) => sum + s.totalPrice.COP, 0))
      };
      const totalLocations = countryLocations.length;
      const averageRevenuePerLocation = {
        USD: totalLocations > 0 ? round2(totalRevenue.USD / totalLocations) : 0,
        COP: totalLocations > 0 ? round2(totalRevenue.COP / totalLocations) : 0
      };
      return {
        totalLocations,
        totalRevenue,
        averageRevenuePerLocation,
        totalSales: countrySales.length
      };
    }
    return {
      Colombia: metricsFor("Colombia"),
      USA: metricsFor("USA")
    };
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
    },
    {
      id: "ITEM-COKE",
      name: "Coca-Cola",
      category: "Beverage",
      basePrice: { USD: 2.5, COP: 1e4 },
      ingredientCost: { USD: 0.8, COP: 3200 },
      prepTimeMinutes: 2,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-TRESLECHES",
      name: "Tres Leches",
      category: "Dessert",
      basePrice: { USD: 6, COP: 24e3 },
      ingredientCost: { USD: 2.1, COP: 8400 },
      prepTimeMinutes: 5,
      isAvailableInColombia: true,
      isAvailableInUSA: false,
      allergens: ["L\xE1cteos", "Huevo"],
      status: "Active"
    },
    {
      id: "ITEM-COMBO-FAMILIAR",
      name: "Combo Familiar",
      category: "Combo",
      basePrice: { USD: 42, COP: 168e3 },
      ingredientCost: { USD: 16.5, COP: 66e3 },
      prepTimeMinutes: 25,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Seasonal"
    },
    {
      id: "ITEM-COSTILLA",
      name: "Costilla BBQ",
      category: "Meat",
      basePrice: { USD: 22.5, COP: 9e4 },
      ingredientCost: { USD: 9, COP: 36e3 },
      prepTimeMinutes: 30,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-CHORIZO",
      name: "Chorizo parrillero",
      category: "Meat",
      basePrice: { USD: 7.5, COP: 3e4 },
      ingredientCost: { USD: 2.8, COP: 11200 },
      prepTimeMinutes: 12,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-POLLO-BRASA",
      name: "Pollo a la brasa",
      category: "Meat",
      basePrice: { USD: 16, COP: 64e3 },
      ingredientCost: { USD: 6.2, COP: 24800 },
      prepTimeMinutes: 25,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-LOMO",
      name: "Lomo a la parrilla",
      category: "Meat",
      basePrice: { USD: 19.5, COP: 78e3 },
      ingredientCost: { USD: 7.8, COP: 31200 },
      prepTimeMinutes: 20,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-MORCILLA",
      name: "Morcilla artesanal",
      category: "Meat",
      basePrice: { USD: 6.5, COP: 26e3 },
      ingredientCost: { USD: 2.4, COP: 9600 },
      prepTimeMinutes: 12,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-JUGO-NATURAL",
      name: "Jugo natural de maracuy\xE1",
      category: "Beverage",
      basePrice: { USD: 4, COP: 16e3 },
      ingredientCost: { USD: 1.3, COP: 5200 },
      prepTimeMinutes: 5,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-CERVEZA-ARTESANAL",
      name: "Cerveza artesanal",
      category: "Beverage",
      basePrice: { USD: 7, COP: 28e3 },
      ingredientCost: { USD: 2.5, COP: 1e4 },
      prepTimeMinutes: 2,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: ["Gluten"],
      status: "Active"
    },
    {
      id: "ITEM-LIMONADA",
      name: "Limonada de la casa",
      category: "Beverage",
      basePrice: { USD: 3.5, COP: 14e3 },
      ingredientCost: { USD: 1, COP: 4e3 },
      prepTimeMinutes: 4,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-YUCA-FRITA",
      name: "Yuca frita",
      category: "Side",
      basePrice: { USD: 4, COP: 16e3 },
      ingredientCost: { USD: 1.1, COP: 4400 },
      prepTimeMinutes: 10,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: [],
      status: "Active"
    },
    {
      id: "ITEM-FLAN-CARAMELO",
      name: "Flan de caramelo",
      category: "Dessert",
      basePrice: { USD: 5, COP: 2e4 },
      ingredientCost: { USD: 1.7, COP: 6800 },
      prepTimeMinutes: 5,
      isAvailableInColombia: true,
      isAvailableInUSA: true,
      allergens: ["L\xE1cteos", "Huevo"],
      status: "Active"
    }
  ];
  var sampleLocations = [
    // Medellín
    { id: "LOC-MEDELLIN-01", name: "Brasaland El Poblado", city: "Medell\xEDn", country: "Colombia", openingYear: 2008, seatingCapacity: 80, staffCount: 12, monthlyRentCost: { USD: 1500, COP: 6e6 }, averageMonthlyUtilities: { USD: 400, COP: 16e5 }, manager: "Carlos Jim\xE9nez", status: "Active" },
    { id: "LOC-MEDELLIN-02", name: "Brasaland Laureles", city: "Medell\xEDn", country: "Colombia", openingYear: 2011, seatingCapacity: 65, staffCount: 10, monthlyRentCost: { USD: 1300, COP: 52e5 }, averageMonthlyUtilities: { USD: 350, COP: 14e5 }, manager: "Daniela Ruiz", status: "Active" },
    { id: "LOC-MEDELLIN-03", name: "Brasaland Envigado", city: "Medell\xEDn", country: "Colombia", openingYear: 2013, seatingCapacity: 70, staffCount: 11, monthlyRentCost: { USD: 1400, COP: 56e5 }, averageMonthlyUtilities: { USD: 380, COP: 152e4 }, manager: "Felipe V\xE9lez", status: "Active" },
    { id: "LOC-MEDELLIN-04", name: "Brasaland Sabaneta", city: "Medell\xEDn", country: "Colombia", openingYear: 2016, seatingCapacity: 55, staffCount: 9, monthlyRentCost: { USD: 1100, COP: 44e5 }, averageMonthlyUtilities: { USD: 300, COP: 12e5 }, manager: "Valentina Ospina", status: "Active" },
    // Bogotá
    { id: "LOC-BOGOTA-01", name: "Brasaland Usaqu\xE9n", city: "Bogot\xE1", country: "Colombia", openingYear: 2014, seatingCapacity: 60, staffCount: 10, monthlyRentCost: { USD: 1800, COP: 72e5 }, averageMonthlyUtilities: { USD: 450, COP: 18e5 }, manager: "Laura Pe\xF1a", status: "Active" },
    { id: "LOC-BOGOTA-02", name: "Brasaland Chapinero", city: "Bogot\xE1", country: "Colombia", openingYear: 2017, seatingCapacity: 50, staffCount: 9, monthlyRentCost: { USD: 1700, COP: 68e5 }, averageMonthlyUtilities: { USD: 420, COP: 168e4 }, manager: "Andr\xE9s Lozano", status: "Active" },
    { id: "LOC-BOGOTA-03", name: "Brasaland Zona Rosa", city: "Bogot\xE1", country: "Colombia", openingYear: 2019, seatingCapacity: 75, staffCount: 13, monthlyRentCost: { USD: 2200, COP: 88e5 }, averageMonthlyUtilities: { USD: 500, COP: 2e6 }, manager: "Camila Torres", status: "Active" },
    // Cali
    { id: "LOC-CALI-01", name: "Brasaland Granada", city: "Cali", country: "Colombia", openingYear: 2015, seatingCapacity: 55, staffCount: 9, monthlyRentCost: { USD: 1200, COP: 48e5 }, averageMonthlyUtilities: { USD: 320, COP: 128e4 }, manager: "Juan Pablo Rengifo", status: "Active" },
    { id: "LOC-CALI-02", name: "Brasaland Ciudad Jard\xEDn", city: "Cali", country: "Colombia", openingYear: 2018, seatingCapacity: 60, staffCount: 10, monthlyRentCost: { USD: 1250, COP: 5e6 }, averageMonthlyUtilities: { USD: 330, COP: 132e4 }, manager: "Isabel Victoria", status: "Active" },
    { id: "LOC-CALI-03", name: "Brasaland Unicentro", city: "Cali", country: "Colombia", openingYear: 2020, seatingCapacity: 65, staffCount: 11, monthlyRentCost: { USD: 1350, COP: 54e5 }, averageMonthlyUtilities: { USD: 360, COP: 144e4 }, manager: "Esteban G\xF3mez", status: "Temporarily closed" },
    // Miami
    { id: "LOC-MIAMI-01", name: "Brasaland Brickell", city: "Miami", country: "USA", openingYear: 2018, seatingCapacity: 100, staffCount: 15, monthlyRentCost: { USD: 5500, COP: 22e6 }, averageMonthlyUtilities: { USD: 800, COP: 32e5 }, manager: "Jake Morrison", status: "Active" },
    { id: "LOC-MIAMI-02", name: "Brasaland Coral Gables", city: "Miami", country: "USA", openingYear: 2021, seatingCapacity: 90, staffCount: 14, monthlyRentCost: { USD: 5200, COP: 208e5 }, averageMonthlyUtilities: { USD: 750, COP: 3e6 }, manager: "Amanda Reyes", status: "Active" },
    // Orlando
    { id: "LOC-ORLANDO-01", name: "Brasaland Downtown", city: "Orlando", country: "USA", openingYear: 2021, seatingCapacity: 70, staffCount: 11, monthlyRentCost: { USD: 4200, COP: 168e5 }, averageMonthlyUtilities: { USD: 650, COP: 26e5 }, manager: "Sof\xEDa Ram\xEDrez", status: "Under renovation" },
    { id: "LOC-ORLANDO-02", name: "Brasaland International Drive", city: "Orlando", country: "USA", openingYear: 2022, seatingCapacity: 85, staffCount: 13, monthlyRentCost: { USD: 4600, COP: 184e5 }, averageMonthlyUtilities: { USD: 700, COP: 28e5 }, manager: "Michael Torres", status: "Active" }
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
    },
    {
      id: "TXN-2024-15484",
      locationId: "LOC-BOGOTA-01",
      itemId: "ITEM-COMBO-FAMILIAR",
      quantity: 1,
      totalPrice: { USD: 42, COP: 168e3 },
      paymentMethod: "Debit card",
      timestamp: /* @__PURE__ */ new Date("2024-03-16T13:10:00"),
      waiterName: "Andr\xE9s Lozano"
    },
    {
      id: "TXN-2024-15485",
      locationId: "LOC-MEDELLIN-01",
      itemId: "ITEM-COKE",
      quantity: 4,
      totalPrice: { USD: 10, COP: 4e4 },
      paymentMethod: "Digital wallet",
      timestamp: /* @__PURE__ */ new Date("2024-03-16T14:00:00"),
      waiterName: "Mar\xEDa Gonz\xE1lez"
    },
    {
      id: "TXN-2024-15486",
      locationId: "LOC-MIAMI-01",
      itemId: "ITEM-TRESLECHES",
      quantity: 2,
      totalPrice: { USD: 12, COP: 48e3 },
      paymentMethod: "Credit card",
      timestamp: /* @__PURE__ */ new Date("2024-03-17T21:05:00"),
      waiterName: "Jake Morrison"
    }
  ];
  var sampleWasteRecords = [
    {
      id: "WASTE-0001",
      locationId: "LOC-MEDELLIN-01",
      itemId: "ITEM-PICANHA-250",
      quantity: 2,
      reason: "Expired",
      cost: { USD: 14.4, COP: 57600 },
      timestamp: /* @__PURE__ */ new Date("2024-03-14T08:00:00"),
      reportedBy: "Carlos Jim\xE9nez"
    },
    {
      id: "WASTE-0002",
      locationId: "LOC-MIAMI-01",
      itemId: "ITEM-FRIES",
      quantity: 5,
      reason: "Cooking error",
      cost: { USD: 6, COP: 24e3 },
      timestamp: /* @__PURE__ */ new Date("2024-03-15T12:30:00"),
      reportedBy: "Jake Morrison"
    },
    {
      id: "WASTE-0003",
      locationId: "LOC-BOGOTA-01",
      itemId: "ITEM-TRESLECHES",
      quantity: 3,
      reason: "Customer return",
      cost: { USD: 6.3, COP: 25200 },
      timestamp: /* @__PURE__ */ new Date("2024-03-16T19:45:00"),
      reportedBy: "Laura Pe\xF1a"
    }
  ];
  window.Brasaland = {
    sampleMenuItems,
    sampleLocations,
    sampleSales,
    sampleWasteRecords,
    // search
    findLocationById,
    findMenuItemByName,
    binarySearchLocationByCapacity,
    // collections
    sortLocationsByCapacity,
    filterActiveLocations,
    filterMenuItemsByCategory,
    sortMenuItemsByPrice,
    filterSalesByDateRange,
    // transformations
    calculateDailyRevenue,
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
    // validations
    validateMenuItem,
    validateSaleTransaction,
    validateLocation
  };
})();
