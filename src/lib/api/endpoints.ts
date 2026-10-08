import { apiFetch } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "employee";
}
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (input: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    countryCode?: string;
    gst?: string;
  }) => apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: input, auth: false }),
  login: (input: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/login", { method: "POST", body: input, auth: false }),
  logout: (refreshToken: string) =>
    apiFetch<{ ok: true }>("/api/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),
  me: () => apiFetch<AuthUser & { activeBusinessId: string | null }>("/api/auth/me"),
};

export interface AdminDashboardResponse {
  stats: {
    totalUsers: number;
    totalBusinesses: number;
    running: number;
    doingWell: number;
    needsConsultancy: number;
  };
  users: Array<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
    name: string;
    phone: string;
    countryCode: string;
    gst: string;
  }>;
  businesses: Array<{
    id: string;
    name: string;
    category: string;
    emoji: string;
    color: string;
    createdAt: string;
    ownerEmail: string;
    revenue: number;
    expenses: number;
    profit: number;
    status: string;
  }>;
}

export const adminApi = {
  getDashboard: () => apiFetch<AdminDashboardResponse>("/api/admin/dashboard"),
  addUser: (user: Record<string, any>) =>
    apiFetch<any>("/api/admin/users", { method: "POST", body: user }),
  deleteUser: (id: string) => apiFetch<any>(`/api/admin/users/${id}`, { method: "DELETE" }),
};

export interface Business {
  _id: string;
  name: string;
  category: string;
  emoji: string;
  color: "violet" | "cyan" | "success" | "warning";
}

export const businessesApi = {
  list: () => apiFetch<{ items: Business[] }>("/api/businesses"),
  create: (b: Partial<Business>) =>
    apiFetch<Business>("/api/businesses", { method: "POST", body: b }),
  update: (id: string, b: Partial<Business>) =>
    apiFetch<Business>(`/api/businesses/${id}`, { method: "PUT", body: b }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/businesses/${id}`, { method: "DELETE" }),
};

export interface DashboardResponse {
  kpis: {
    revenue: number;
    expenses: number;
    profit: number;
    growth: number;
    employees: number;
    inventory: number;
    businesses: number;
  };
  series: { month: string; sales: number; expenses: number; profit: number }[];
  categoryShare: { name: string; value: number }[];
}

export const dashboardApi = {
  get: (businessId?: string) =>
    apiFetch<DashboardResponse>("/api/dashboard", { query: { businessId } }),
};

export interface Sale {
  _id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  businessId: { _id: string; name: string; emoji: string } | string;
  occurredAt: string;
  customer?: string;
}

export const salesApi = {
  list: (q: { businessId?: string; q?: string; page?: number; pageSize?: number }) =>
    apiFetch<{ items: Sale[]; total: number; page: number; pageSize: number }>("/api/sales", {
      query: q,
    }),
  create: (body: {
    businessId: string;
    product: string;
    quantity: number;
    unitPrice: number;
    inventoryItemId?: string | null;
    customer?: string;
  }) => apiFetch<Sale>("/api/sales", { method: "POST", body }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/sales/${id}`, { method: "DELETE" }),
};

export interface Expense {
  _id: string;
  category: string;
  amount: number;
  note?: string;
  businessId: { _id: string; name: string; emoji: string } | string;
  occurredAt: string;
}

export const expensesApi = {
  list: (q: { businessId?: string; q?: string; page?: number; pageSize?: number }) =>
    apiFetch<{ items: Expense[]; total: number; page: number; pageSize: number }>("/api/expenses", {
      query: q,
    }),
  create: (body: { businessId: string; category: string; amount: number; note?: string }) =>
    apiFetch<Expense>("/api/expenses", { method: "POST", body }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/expenses/${id}`, { method: "DELETE" }),
};

export interface InventoryItem {
  _id: string;
  name: string;
  sku?: string;
  category: string;
  qty: number;
  threshold: number;
  unitPrice: number;
  businessId: { _id: string; name: string; emoji: string } | string;
}

export const inventoryApi = {
  list: (q: { businessId?: string; q?: string; low?: boolean }) =>
    apiFetch<{ items: InventoryItem[]; total: number }>("/api/inventory", { query: q }),
  create: (
    body: Partial<InventoryItem> & {
      businessId: string;
      name: string;
      qty: number;
      threshold: number;
      unitPrice: number;
    },
  ) => apiFetch<InventoryItem>("/api/inventory", { method: "POST", body }),
  update: (id: string, body: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>(`/api/inventory/${id}`, { method: "PUT", body }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/inventory/${id}`, { method: "DELETE" }),
};

export interface Employee {
  _id: string;
  name: string;
  role: string;
  salary: number;
  status: "Active" | "On leave" | "Inactive";
  businessId: { _id: string; name: string; emoji: string } | string;
}

export const employeesApi = {
  list: (q: { businessId?: string; q?: string }) =>
    apiFetch<{ items: Employee[] }>("/api/employees", { query: q }),
  create: (
    body: Partial<Employee> & { businessId: string; name: string; role: string; salary: number },
  ) => apiFetch<Employee>("/api/employees", { method: "POST", body }),
  update: (id: string, body: Partial<Employee>) =>
    apiFetch<Employee>(`/api/employees/${id}`, { method: "PUT", body }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/employees/${id}`, { method: "DELETE" }),
};

export interface Notification {
  _id: string;
  tone: "warning" | "destructive" | "success" | "primary";
  title: string;
  body?: string;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () => apiFetch<{ items: Notification[]; unread: number }>("/api/notifications"),
  readAll: () => apiFetch<{ ok: true }>("/api/notifications/read-all", { method: "POST" }),
};
