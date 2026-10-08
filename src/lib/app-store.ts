import { useSyncExternalStore } from "react";

export type AppBusiness = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  color: "violet" | "cyan" | "success" | "warning";
};

export type AppSale = {
  id: string;
  product: string;
  businessId: string;
  business: string;
  amount: number;
  date: string;
};

export type AppExpense = {
  id: string;
  category: string;
  businessId: string;
  business: string;
  amount: number;
  date: string;
};

export type AppInventoryItem = {
  id: string;
  name: string;
  businessId: string;
  business: string;
  category: string;
  qty: number;
  threshold: number;
  unitPrice: number;
  sku?: string;
};

export type AppEmployee = {
  id: string;
  name: string;
  role: string;
  businessId: string;
  business: string;
  salary: number;
  status: "Active" | "On leave" | "Inactive";
};

export type AppState = {
  businesses: AppBusiness[];
  sales: AppSale[];
  expenses: AppExpense[];
  inventory: AppInventoryItem[];
  employees: AppEmployee[];
};

const STORAGE_KEY = "nexora.appState_v2";

const DEMO_STATE: AppState = {
  businesses: [
    { id: "rest", name: "Saffron Kitchen", category: "Restaurant", emoji: "🍜", color: "warning" },
    { id: "cloth", name: "Atelier 22", category: "Clothing Shop", emoji: "👗", color: "violet" },
    {
      id: "agency",
      name: "Northwind Digital",
      category: "Digital Agency",
      emoji: "💻",
      color: "cyan",
    },
    {
      id: "pharma",
      name: "WellCare Pharma",
      category: "Medical Store",
      emoji: "💊",
      color: "success",
    },
  ],
  sales: [
    {
      id: "S-101",
      product: "Tasting Menu × 4",
      businessId: "rest",
      business: "Saffron Kitchen",
      amount: 4120,
      date: "Today",
    },
    {
      id: "S-102",
      product: "Linen Co-ord Set",
      businessId: "cloth",
      business: "Atelier 22",
      amount: 1890,
      date: "Today",
    },
    {
      id: "S-103",
      product: "Brand Retainer",
      businessId: "agency",
      business: "Northwind Digital",
      amount: 42000,
      date: "Yesterday",
    },
    {
      id: "S-104",
      product: "Prescription Refill",
      businessId: "pharma",
      business: "WellCare Pharma",
      amount: 640,
      date: "Yesterday",
    },
    {
      id: "S-105",
      product: "Cashmere Scarf",
      businessId: "cloth",
      business: "Atelier 22",
      amount: 2200,
      date: "2d ago",
    },
  ],
  expenses: [
    {
      id: "E-101",
      category: "Rent",
      businessId: "rest",
      business: "Saffron Kitchen",
      amount: 32000,
      date: "Today",
    },
    {
      id: "E-102",
      category: "Salaries",
      businessId: "agency",
      business: "Northwind Digital",
      amount: 118000,
      date: "Yesterday",
    },
    {
      id: "E-103",
      category: "Inventory",
      businessId: "pharma",
      business: "WellCare Pharma",
      amount: 21500,
      date: "2d ago",
    },
    {
      id: "E-104",
      category: "Electricity",
      businessId: "cloth",
      business: "Atelier 22",
      amount: 4100,
      date: "3d ago",
    },
  ],
  inventory: [
    {
      id: "P-101",
      name: "Saffron Risotto Kit",
      businessId: "rest",
      business: "Saffron Kitchen",
      category: "Food",
      qty: 8,
      threshold: 12,
      unitPrice: 450,
      sku: "SKU-RISOTTO",
    },
    {
      id: "P-102",
      name: "Linen Co-ord Set",
      businessId: "cloth",
      business: "Atelier 22",
      category: "Apparel",
      qty: 34,
      threshold: 10,
      unitPrice: 1890,
      sku: "SKU-LINEN",
    },
    {
      id: "P-103",
      name: "Cashmere Scarf",
      businessId: "cloth",
      business: "Atelier 22",
      category: "Apparel",
      qty: 6,
      threshold: 8,
      unitPrice: 2200,
      sku: "SKU-SCARF",
    },
    {
      id: "P-104",
      name: "Paracetamol 500mg",
      businessId: "pharma",
      business: "WellCare Pharma",
      category: "OTC",
      qty: 142,
      threshold: 40,
      unitPrice: 40,
      sku: "SKU-PARA",
    },
    {
      id: "P-105",
      name: "Vitamin D3 Drops",
      businessId: "pharma",
      business: "WellCare Pharma",
      category: "OTC",
      qty: 12,
      threshold: 20,
      unitPrice: 350,
      sku: "SKU-VITD",
    },
    {
      id: "P-106",
      name: "Truffle Oil 250ml",
      businessId: "rest",
      business: "Saffron Kitchen",
      category: "Food",
      qty: 4,
      threshold: 10,
      unitPrice: 1200,
      sku: "SKU-TRUFFLE",
    },
  ],
  employees: [
    {
      id: "U-101",
      name: "Aarav Mehta",
      role: "Head Chef",
      businessId: "rest",
      business: "Saffron Kitchen",
      salary: 48000,
      status: "Active",
    },
    {
      id: "U-102",
      name: "Sana Iqbal",
      role: "Store Manager",
      businessId: "cloth",
      business: "Atelier 22",
      salary: 36000,
      status: "Active",
    },
    {
      id: "U-103",
      name: "Leon Whitaker",
      role: "Creative Lead",
      businessId: "agency",
      business: "Northwind Digital",
      salary: 68000,
      status: "Active",
    },
    {
      id: "U-104",
      name: "Priya Raghavan",
      role: "Pharmacist",
      businessId: "pharma",
      business: "WellCare Pharma",
      salary: 42000,
      status: "On leave",
    },
  ],
};

const EMPTY_STATE: AppState = {
  businesses: [],
  sales: [],
  expenses: [],
  inventory: [],
  employees: [],
};

function loadInitialState(): AppState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    /* ignore parse error */
  }
  return EMPTY_STATE;
}

let currentState: AppState = loadInitialState();
const listeners = new Set<() => void>();

function saveAndEmit() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  }
  listeners.forEach((l) => l());
}

export const appStore = {
  get: () => currentState,

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  loadDemoData: () => {
    currentState = DEMO_STATE;
    saveAndEmit();
  },

  clearAllData: () => {
    currentState = EMPTY_STATE;
    saveAndEmit();
  },

  addBusiness: (biz: Omit<AppBusiness, "id">) => {
    const newBiz: AppBusiness = {
      ...biz,
      id: "biz_" + Date.now(),
    };
    currentState = {
      ...currentState,
      businesses: [newBiz, ...currentState.businesses],
    };
    saveAndEmit();
    return newBiz;
  },

  addSale: (sale: Omit<AppSale, "id">) => {
    const newSale: AppSale = {
      ...sale,
      id: "S-" + Math.floor(1000 + Math.random() * 9000),
    };

    // Auto deduct inventory stock if product exists
    const updatedInventory = currentState.inventory.map((item) => {
      if (item.name.toLowerCase() === sale.product.toLowerCase() || item.id === sale.product) {
        return { ...item, qty: Math.max(0, item.qty - 1) };
      }
      return item;
    });

    currentState = {
      ...currentState,
      sales: [newSale, ...currentState.sales],
      inventory: updatedInventory,
    };
    saveAndEmit();
    return newSale;
  },

  addExpense: (expense: Omit<AppExpense, "id">) => {
    const newExpense: AppExpense = {
      ...expense,
      id: "E-" + Math.floor(100 + Math.random() * 900),
    };
    currentState = {
      ...currentState,
      expenses: [newExpense, ...currentState.expenses],
    };
    saveAndEmit();
    return newExpense;
  },

  addInventoryItem: (item: Omit<AppInventoryItem, "id">) => {
    const newItem: AppInventoryItem = {
      ...item,
      id: "P-" + Math.floor(100 + Math.random() * 900),
    };
    currentState = {
      ...currentState,
      inventory: [newItem, ...currentState.inventory],
    };
    saveAndEmit();
    return newItem;
  },

  deleteInventoryItem: (id: string) => {
    currentState = {
      ...currentState,
      inventory: currentState.inventory.filter((i) => i.id !== id),
    };
    saveAndEmit();
  },

  addEmployee: (emp: Omit<AppEmployee, "id">) => {
    const newEmp: AppEmployee = {
      ...emp,
      id: "U-" + Math.floor(10 + Math.random() * 90),
    };
    currentState = {
      ...currentState,
      employees: [newEmp, ...currentState.employees],
    };
    saveAndEmit();
    return newEmp;
  },

  deleteBusiness: (id: string) => {
    currentState = {
      ...currentState,
      businesses: currentState.businesses.filter((b) => b.id !== id),
      sales: currentState.sales.filter((s) => s.businessId !== id),
      expenses: currentState.expenses.filter((e) => e.businessId !== id),
      inventory: currentState.inventory.filter((i) => i.businessId !== id),
      employees: currentState.employees.filter((emp) => emp.businessId !== id),
    };
    saveAndEmit();
  },

  deleteSale: (id: string) => {
    currentState = {
      ...currentState,
      sales: currentState.sales.filter((s) => s.id !== id),
    };
    saveAndEmit();
  },

  deleteExpense: (id: string) => {
    currentState = {
      ...currentState,
      expenses: currentState.expenses.filter((e) => e.id !== id),
    };
    saveAndEmit();
  },

  deleteEmployee: (id: string) => {
    currentState = {
      ...currentState,
      employees: currentState.employees.filter((e) => e.id !== id),
    };
    saveAndEmit();
  },
};

const serverSnapshot: AppState = EMPTY_STATE;

export function useAppData() {
  return useSyncExternalStore(
    appStore.subscribe,
    () => appStore.get(),
    () => serverSnapshot,
  );
}

// Helpers for dynamic KPIs and AI suggestions
export function useCalculatedKpis(selectedBizId: string) {
  const data = useAppData();

  const isAll = !selectedBizId || selectedBizId === "all";

  const filteredSales = isAll
    ? data.sales
    : data.sales.filter((s) => s.businessId === selectedBizId || s.business === selectedBizId);

  const filteredExpenses = isAll
    ? data.expenses
    : data.expenses.filter((e) => e.businessId === selectedBizId || e.business === selectedBizId);

  const filteredInventory = isAll
    ? data.inventory
    : data.inventory.filter((i) => i.businessId === selectedBizId || i.business === selectedBizId);

  const filteredEmployees = isAll
    ? data.employees
    : data.employees.filter((e) => e.businessId === selectedBizId || e.business === selectedBizId);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const employeeCount = filteredEmployees.length;
  const inventoryCount = filteredInventory.reduce((sum, i) => sum + i.qty, 0);
  const lowStockCount = filteredInventory.filter((i) => i.qty <= i.threshold).length;
  const totalPayroll = filteredEmployees.reduce((sum, e) => sum + e.salary, 0);

  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";
  const growthRate =
    totalExpenses > 0 ? (((totalRevenue - totalExpenses) / totalExpenses) * 10).toFixed(1) : "0.0";

  return {
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit: netProfit,
    employees: employeeCount,
    inventory: inventoryCount,
    lowStockCount,
    totalPayroll,
    profitMargin: Number(profitMargin),
    growth: Math.max(0, Number(growthRate)),
    businessCount: isAll ? data.businesses.length : 1,
    salesCount: filteredSales.length,
  };
}

export function useDynamicAiInsights(selectedBizId: string) {
  const data = useAppData();
  const kpis = useCalculatedKpis(selectedBizId);

  const insights: Array<{ tone: "positive" | "warning" | "neutral"; title: string; body: string }> =
    [];

  if (data.businesses.length === 0) {
    insights.push({
      tone: "neutral",
      title: "Create your first business to unlock AI analytics",
      body: "Welcome! Add your store, restaurant, agency or shop to start tracking real-time sales, expenses, and growth.",
    });
    insights.push({
      tone: "positive",
      title: "Zero setup cost — 100% portfolio visibility",
      body: "Record transactions and inventory as you grow. AI will automatically optimize your cashflow and stock alerts.",
    });
    return insights;
  }

  if (kpis.revenue > 0) {
    insights.push({
      tone: "positive",
      title: `Portfolio revenue is at ₹${kpis.revenue.toLocaleString()}`,
      body: `Net profit margin is ${kpis.profitMargin}%. Consider reinvesting excess profit into top-performing channels.`,
    });
  } else {
    insights.push({
      tone: "neutral",
      title: "No sales recorded yet for this period",
      body: "Click '+ New sale' on the Sales page to log transactions and generate dynamic growth projections.",
    });
  }

  if (kpis.lowStockCount > 0) {
    insights.push({
      tone: "warning",
      title: `${kpis.lowStockCount} inventory items are below threshold`,
      body: "Low stock items detected! Restock immediately to prevent lost sales opportunities.",
    });
  }

  if (kpis.expenses > kpis.revenue && kpis.expenses > 0) {
    insights.push({
      tone: "warning",
      title: "Expenses exceed revenue this period",
      body: `Total expenses stand at ₹${kpis.expenses.toLocaleString()}. Review operational costs and employee payroll.`,
    });
  } else if (kpis.employees > 0) {
    insights.push({
      tone: "neutral",
      title: `Team of ${kpis.employees} employees managed`,
      body: `Monthly payroll total is ₹${kpis.totalPayroll.toLocaleString()}. Employee efficiency is healthy.`,
    });
  }

  return insights.slice(0, 3);
}

export function useAccurateMonthlySeries(selectedBizId: string) {
  const data = useAppData();
  const isAll = !selectedBizId || selectedBizId === "all";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonthIdx = new Date().getMonth();

  const filteredSales = isAll
    ? data.sales
    : data.sales.filter((s) => s.businessId === selectedBizId || s.business === selectedBizId);

  const filteredExpenses = isAll
    ? data.expenses
    : data.expenses.filter((e) => e.businessId === selectedBizId || e.business === selectedBizId);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return months.map((month, idx) => {
    let mSales = 0;
    let mExpenses = 0;

    filteredSales.forEach((s) => {
      if (
        s.date.includes(month) ||
        (idx === currentMonthIdx &&
          (s.date === "Today" || s.date === "Yesterday" || s.date.includes("ago")))
      ) {
        mSales += s.amount;
      }
    });

    filteredExpenses.forEach((e) => {
      if (
        e.date.includes(month) ||
        (idx === currentMonthIdx &&
          (e.date === "Today" || e.date === "Yesterday" || e.date.includes("ago")))
      ) {
        mExpenses += e.amount;
      }
    });

    if (mSales === 0 && totalSales > 0 && idx <= currentMonthIdx) {
      mSales = Math.round(totalSales / (currentMonthIdx + 1));
    }
    if (mExpenses === 0 && totalExpenses > 0 && idx <= currentMonthIdx) {
      mExpenses = Math.round(totalExpenses / (currentMonthIdx + 1));
    }

    return {
      month,
      sales: mSales,
      expenses: mExpenses,
      profit: mSales - mExpenses,
    };
  });
}

export function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
