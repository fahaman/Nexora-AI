import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { authStore } from "@/lib/auth-store";
import { useEffect, useState, useMemo } from "react";
import { adminApi, type AdminDashboardResponse } from "@/lib/api/endpoints";
import {
  Users,
  Building2,
  ShieldAlert,
  Activity,
  ArrowLeft,
  Loader2,
  Phone,
  FileText,
  Trash2,
  Plus,
  X,
  Award,
  AlertTriangle,
  BadgeAlert,
  Package,
  UserCheck,
  Store,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useAppData, appStore, fmt } from "@/lib/app-store";

export const Route = createFileRoute("/app/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const user = authStore.get().user;
      if (!user) throw redirect({ to: "/login" });
      if (user.email !== "admin@nexora.com") throw redirect({ to: "/app" });
    }
  },
  component: AdminPanel,
});

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  countryCode?: string;
  gst?: string;
  createdAt?: string;
}

const STORAGE_USERS_KEY = "nexora.adminUsers_v1";

const DEFAULT_USERS: AdminUserRecord[] = [
  {
    id: "admin-master",
    name: "Master Admin",
    email: "admin@nexora.com",
    role: "admin",
    phone: "9876543210",
    countryCode: "+91",
    gst: "29AAAAA0000A1Z5",
    createdAt: "2026-01-01",
  },
  {
    id: "owner-1",
    name: "Vikram Malhotra",
    email: "vikram@saffronkitchen.com",
    role: "manager",
    phone: "9812345678",
    countryCode: "+91",
    gst: "27ABCDE1234F1Z5",
    createdAt: "2026-02-15",
  },
  {
    id: "owner-2",
    name: "Elena Rostova",
    email: "elena@atelier22.com",
    role: "manager",
    phone: "9123456780",
    countryCode: "+91",
    gst: "24XYZAB5678C1Z2",
    createdAt: "2026-03-01",
  },
];

function loadLocalUsers(): AdminUserRecord[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return DEFAULT_USERS;
}

function saveLocalUsers(users: AdminUserRecord[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }
}

function AdminPanel() {
  const { businesses, sales, expenses, inventory, employees } = useAppData();

  const [usersList, setUsersList] = useState<AdminUserRecord[]>(() => loadLocalUsers());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "businesses" | "inventory" | "employees">(
    "users",
  );

  // Filter by selected business in tabs
  const [selectedFilterBiz, setSelectedFilterBiz] = useState<string>("all");

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  // User form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manager");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [gst, setGst] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Business form
  const [bizName, setBizName] = useState("");
  const [bizCategory, setBizCategory] = useState("Retail & Commerce");
  const [bizEmoji, setBizEmoji] = useState("🏬");
  const [bizColor, setBizColor] = useState<"violet" | "cyan" | "success" | "warning">("violet");
  const [bizOwnerEmail, setBizOwnerEmail] = useState("");

  // Inventory form
  const [invName, setInvName] = useState("");
  const [invSku, setInvSku] = useState("");
  const [invCategory, setInvCategory] = useState("General");
  const [invQty, setInvQty] = useState("");
  const [invThreshold, setInvThreshold] = useState("10");
  const [invUnitPrice, setInvUnitPrice] = useState("");
  const [invBizId, setInvBizId] = useState("");

  // Employee form
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [empSalary, setEmpSalary] = useState("");
  const [empStatus, setEmpStatus] = useState<"Active" | "On leave" | "Inactive">("Active");
  const [empBizId, setEmpBizId] = useState("");

  // Save users state change
  const updateUsers = (newUsers: AdminUserRecord[]) => {
    setUsersList(newUsers);
    saveLocalUsers(newUsers);
  };

  // Try API dashboard sync in background if backend exists, fallback gracefully
  useEffect(() => {
    adminApi
      .getDashboard()
      .then((res) => {
        if (res?.users && res.users.length > 0) {
          const mapped: AdminUserRecord[] = res.users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            countryCode: u.countryCode,
            gst: u.gst,
            createdAt: u.createdAt,
          }));
          updateUsers(mapped);
        }
      })
      .catch(() => {
        // Backend not deployed yet - gracefully use client-side persistent storage
      });
  }, []);

  // Compute calculated metrics
  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + s.amount, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const totalProfit = totalRevenue - totalExpenses;

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Attempt backend API
      try {
        await adminApi.addUser({
          name,
          email,
          password,
          role,
          phone,
          countryCode,
          gst: gst || undefined,
        });
      } catch {
        /* proceed locally if backend is unavailable */
      }

      const newUser: AdminUserRecord = {
        id: "usr_" + Date.now(),
        name,
        email,
        role,
        phone,
        countryCode,
        gst,
        createdAt: new Date().toISOString().split("T")[0],
      };

      updateUsers([newUser, ...usersList]);
      toast.success(`User "${name}" added successfully!`);
      setIsUserModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("manager");
      setPhone("");
      setCountryCode("+91");
      setGst("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (userEmail === "admin@nexora.com") {
      toast.error("Cannot delete master admin account");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete user "${userEmail}"? This will also remove access to this workspace.`,
      )
    ) {
      return;
    }
    try {
      try {
        await adminApi.deleteUser(id);
      } catch {
        /* proceed locally */
      }
      updateUsers(usersList.filter((u) => u.id !== id && u.email !== userEmail));
      toast.success(`User ${userEmail} removed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  // Add Business
  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) return;

    const newBiz = appStore.addBusiness({
      name: bizName,
      category: bizCategory,
      emoji: bizEmoji || "🏬",
      color: bizColor,
    });

    toast.success(`Business "${newBiz.name}" created!`);
    setIsBizModalOpen(false);
    setBizName("");
    setBizCategory("Retail & Commerce");
    setBizEmoji("🏬");
  };

  // Delete Business
  const handleDeleteBusiness = (id: string, name: string) => {
    if (
      !confirm(
        `Admin Action: Delete business "${name}" and all associated sales, inventory, and employees?`,
      )
    ) {
      return;
    }
    appStore.deleteBusiness(id);
    toast.success(`Business "${name}" deleted.`);
  };

  // Add Inventory Item
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || !invQty || !invUnitPrice) return;

    const targetBiz = businesses.find((b) => b.id === invBizId) || businesses[0];
    if (!targetBiz) {
      toast.error("Please add a business first.");
      return;
    }

    appStore.addInventoryItem({
      name: invName,
      sku: invSku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
      category: invCategory || "General",
      qty: Number(invQty),
      threshold: Number(invThreshold) || 10,
      unitPrice: Number(invUnitPrice),
      businessId: targetBiz.id,
      business: targetBiz.name,
    });

    toast.success(`Inventory item "${invName}" added to ${targetBiz.name}!`);
    setIsInvModalOpen(false);
    setInvName("");
    setInvSku("");
    setInvQty("");
    setInvUnitPrice("");
  };

  // Delete Inventory Item
  const handleDeleteInventory = (id: string, name: string) => {
    if (!confirm(`Delete product "${name}" from inventory?`)) return;
    appStore.deleteInventoryItem(id);
    toast.success(`Product "${name}" deleted.`);
  };

  // Add Employee
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empRole.trim() || !empSalary) return;

    const targetBiz = businesses.find((b) => b.id === empBizId) || businesses[0];
    if (!targetBiz) {
      toast.error("Please add a business first.");
      return;
    }

    appStore.addEmployee({
      name: empName,
      role: empRole,
      salary: Number(empSalary),
      status: empStatus,
      businessId: targetBiz.id,
      business: targetBiz.name,
    });

    toast.success(`Employee "${empName}" added to ${targetBiz.name}!`);
    setIsEmpModalOpen(false);
    setEmpName("");
    setEmpRole("");
    setEmpSalary("");
  };

  // Delete Employee
  const handleDeleteEmployee = (id: string, name: string) => {
    if (!confirm(`Delete employee "${name}"?`)) return;
    appStore.deleteEmployee(id);
    toast.success(`Employee "${name}" deleted.`);
  };

  const filteredInventory = useMemo(() => {
    if (selectedFilterBiz === "all") return inventory;
    return inventory.filter(
      (i) => i.businessId === selectedFilterBiz || i.business === selectedFilterBiz,
    );
  }, [inventory, selectedFilterBiz]);

  const filteredEmployees = useMemo(() => {
    if (selectedFilterBiz === "all") return employees;
    return employees.filter(
      (e) => e.businessId === selectedFilterBiz || e.business === selectedFilterBiz,
    );
  }, [employees, selectedFilterBiz]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-muted-foreground mt-1">
            Global management for Owners, Businesses, Inventory, and Staff across Nexora AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-medium">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Master Console Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Users / Owners</p>
            <h3 className="text-xl font-bold mt-0.5">{usersList.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Businesses</p>
            <h3 className="text-xl font-bold mt-0.5">{businesses.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Inventory Units</p>
            <h3 className="text-xl font-bold mt-0.5">{inventory.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Employees</p>
            <h3 className="text-xl font-bold mt-0.5">{employees.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Network Revenue</p>
            <h3 className="text-lg font-bold mt-0.5 text-emerald-500">{fmt(totalRevenue)}</h3>
          </div>
        </div>
      </div>

      {/* Admin Action Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Users className="w-4 h-4" /> Users & Owners ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab("businesses")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "businesses"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="w-4 h-4" /> Businesses ({businesses.length})
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "inventory"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Package className="w-4 h-4" /> All Inventory ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "employees"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <UserCheck className="w-4 h-4" /> All Employees ({employees.length})
        </button>
      </div>

      {/* TAB 1: USERS & OWNERS */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">System Users & Owners</h2>
              <p className="text-xs text-muted-foreground">
                Registered platform administrators and business owners.
              </p>
            </div>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="h-9 px-3.5 rounded-lg bg-gradient-primary text-white text-xs font-medium shadow-glow inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add User / Owner
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/10">
                  <th className="p-4">Name / Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary capitalize font-medium">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {u.countryCode ?? "+91"} {u.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">No phone</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.gst ? (
                        <span className="font-mono text-xs uppercase bg-muted px-1.5 py-0.5 rounded border border-border">
                          {u.gst}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {u.createdAt ?? "2026-01-01"}
                    </td>
                    <td className="p-4">
                      {u.email !== "admin@nexora.com" ? (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/15 text-destructive transition cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Protected Master
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESSES */}
      {activeTab === "businesses" && (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Active Businesses</h2>
              <p className="text-xs text-muted-foreground">
                Manage all registered companies, revenue, and active operations.
              </p>
            </div>
            <button
              onClick={() => setIsBizModalOpen(true)}
              className="h-9 px-3.5 rounded-lg bg-gradient-primary text-white text-xs font-medium shadow-glow inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Business
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/10">
                  <th className="p-4">Business</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Inventory Items</th>
                  <th className="p-4">Employees</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {businesses.map((b) => {
                  const bInvCount = inventory.filter(
                    (i) => i.businessId === b.id || i.business === b.name,
                  ).length;
                  const bEmpCount = employees.filter(
                    (e) => e.businessId === b.id || e.business === b.name,
                  ).length;
                  return (
                    <tr key={b.id} className="hover:bg-muted/10">
                      <td className="p-4 flex items-center gap-3">
                        <span className="text-2xl">{b.emoji}</span>
                        <div>
                          <span className="font-semibold text-foreground">{b.name}</span>
                          <div className="text-[10px] text-muted-foreground">ID: {b.id}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-primary/5 text-primary text-xs px-2.5 py-1 rounded-full border border-primary/10 font-medium">
                          {b.category}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{bInvCount} items</td>
                      <td className="p-4 font-medium">{bEmpCount} employees</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteBusiness(b.id, b.name)}
                          className="p-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/15 text-destructive transition cursor-pointer"
                          title="Delete Business"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY */}
      {activeTab === "inventory" && (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Global Inventory Control</h2>
              <p className="text-xs text-muted-foreground">
                Add, manage, and remove stock for any registered business.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedFilterBiz}
                onChange={(e) => setSelectedFilterBiz(e.target.value)}
                className="h-9 px-3 rounded-lg bg-card border border-border text-xs focus:outline-none"
              >
                <option value="all">All Businesses</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.emoji} {b.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsInvModalOpen(true)}
                className="h-9 px-3.5 rounded-lg bg-gradient-primary text-white text-xs font-medium shadow-glow inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/10">
                  <th className="p-4">Product / SKU</th>
                  <th className="p-4">Business</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock Qty</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.sku || "N/A"}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-muted-foreground">{item.business}</td>
                    <td className="p-4 text-xs">{item.category}</td>
                    <td className="p-4">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-xs ${
                          item.qty <= item.threshold
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}
                      >
                        {item.qty} units
                      </span>
                    </td>
                    <td className="p-4 font-semibold">{fmt(item.unitPrice)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteInventory(item.id, item.name)}
                        className="p-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/15 text-destructive transition cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EMPLOYEES */}
      {activeTab === "employees" && (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Global Employee Directory</h2>
              <p className="text-xs text-muted-foreground">
                Add, manage, and remove staff members across any business.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedFilterBiz}
                onChange={(e) => setSelectedFilterBiz(e.target.value)}
                className="h-9 px-3 rounded-lg bg-card border border-border text-xs focus:outline-none"
              >
                <option value="all">All Businesses</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.emoji} {b.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsEmpModalOpen(true)}
                className="h-9 px-3.5 rounded-lg bg-gradient-primary text-white text-xs font-medium shadow-glow inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Employee
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/10">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Business</th>
                  <th className="p-4">Monthly Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/10">
                    <td className="p-4 font-semibold text-foreground">{emp.name}</td>
                    <td className="p-4 text-xs font-medium text-muted-foreground">{emp.role}</td>
                    <td className="p-4 font-medium text-muted-foreground">{emp.business}</td>
                    <td className="p-4 font-semibold">{fmt(emp.salary)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          emp.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="p-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/15 text-destructive transition cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD USER / OWNER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Add User / Owner</h2>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. John Doe"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Country</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="+91">IN (+91)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+61">AU (+61)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder="Phone number"
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="manager">Business Owner / Manager</option>
                  <option value="admin">Administrator</option>
                  <option value="employee">Staff / Employee</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow cursor-pointer disabled:opacity-75"
                >
                  {submitting ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD BUSINESS */}
      {isBizModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Add New Business</h2>
              <button
                onClick={() => setIsBizModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddBusiness} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Business Name
                </label>
                <input
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  required
                  placeholder="e.g. Apex Logistics"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Category</label>
                <input
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  required
                  placeholder="e.g. Transportation, Retail, Dining"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Emoji Icon
                  </label>
                  <input
                    value={bizEmoji}
                    onChange={(e) => setBizEmoji(e.target.value)}
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Theme Color
                  </label>
                  <select
                    value={bizColor}
                    onChange={(e) =>
                      setBizColor(e.target.value as "violet" | "cyan" | "success" | "warning")
                    }
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                  >
                    <option value="violet">Violet</option>
                    <option value="cyan">Cyan</option>
                    <option value="success">Emerald</option>
                    <option value="warning">Amber</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBizModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow cursor-pointer"
                >
                  Create Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD INVENTORY */}
      {isInvModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Add Product to Business</h2>
              <button
                onClick={() => setIsInvModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddInventory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Target Business
                </label>
                <select
                  value={invBizId}
                  onChange={(e) => setInvBizId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.emoji} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Product Name
                </label>
                <input
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  required
                  placeholder="e.g. Arabica Coffee Beans 1kg"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Quantity
                  </label>
                  <input
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value)}
                    type="number"
                    required
                    placeholder="e.g. 50"
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Unit Price (₹)
                  </label>
                  <input
                    value={invUnitPrice}
                    onChange={(e) => setInvUnitPrice(e.target.value)}
                    type="number"
                    required
                    placeholder="e.g. 750"
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow cursor-pointer"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD EMPLOYEE */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Assign Staff to Business</h2>
              <button
                onClick={() => setIsEmpModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Target Business
                </label>
                <select
                  value={empBizId}
                  onChange={(e) => setEmpBizId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.emoji} {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Staff Member Name
                </label>
                <input
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Designation / Role
                </label>
                <input
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  required
                  placeholder="e.g. Store Manager, Head Chef, Sales Lead"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Monthly Salary (₹)
                </label>
                <input
                  value={empSalary}
                  onChange={(e) => setEmpSalary(e.target.value)}
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow cursor-pointer"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
