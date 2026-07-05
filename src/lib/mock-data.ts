export type Business = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  color: "violet" | "cyan" | "success" | "warning";
};

export const businesses: Business[] = [
  { id: "all", name: "All Businesses", category: "Aggregate view", emoji: "🌐", color: "violet" },
  { id: "rest", name: "Saffron Kitchen", category: "Restaurant", emoji: "🍜", color: "warning" },
  { id: "cloth", name: "Atelier 22", category: "Clothing Shop", emoji: "👗", color: "violet" },
  { id: "agency", name: "Northwind Digital", category: "Digital Agency", emoji: "💻", color: "cyan" },
  { id: "pharma", name: "WellCare Pharma", category: "Medical Store", emoji: "💊", color: "success" },
];

export const kpis = (bizId: string) => {
  const base = {
    all:    { revenue: 184320, expenses: 92110, profit: 92210, employees: 38, inventory: 412, growth: 18.4 },
    rest:   { revenue: 52400, expenses: 31200, profit: 21200, employees: 12, inventory: 86, growth: 12.1 },
    cloth:  { revenue: 41800, expenses: 19400, profit: 22400, employees: 8,  inventory: 154, growth: 22.7 },
    agency: { revenue: 61200, expenses: 24800, profit: 36400, employees: 11, inventory: 0,   growth: 31.2 },
    pharma: { revenue: 28920, expenses: 16710, profit: 12210, employees: 7,  inventory: 172, growth: 6.5 },
  } as const;
  return base[bizId as keyof typeof base] ?? base.all;
};

export const salesSeries = (bizId: string) =>
  Array.from({ length: 12 }).map((_, i) => {
    const month = new Date(2025, i, 1).toLocaleString("en", { month: "short" });
    const seed = bizId.length * 7 + i * 3;
    const sales = 8000 + Math.round(Math.sin(i / 1.6 + seed) * 2200 + i * 480 + (seed % 1200));
    const expenses = 4200 + Math.round(Math.cos(i / 2 + seed) * 1400 + i * 220);
    return { month, sales, expenses, profit: sales - expenses };
  });

export const categoryShare = [
  { name: "Restaurant", value: 28 },
  { name: "Clothing", value: 22 },
  { name: "Agency", value: 33 },
  { name: "Pharma", value: 17 },
];

export const recentSales = [
  { id: "S-2041", product: "Tasting Menu × 4", business: "Saffron Kitchen", amount: 412, date: "Today" },
  { id: "S-2040", product: "Linen Co-ord Set",  business: "Atelier 22",     amount: 189, date: "Today" },
  { id: "S-2039", product: "Brand Retainer",    business: "Northwind Digital", amount: 4200, date: "Yesterday" },
  { id: "S-2038", product: "Prescription Refill", business: "WellCare Pharma", amount: 64, date: "Yesterday" },
  { id: "S-2037", product: "Cashmere Scarf",    business: "Atelier 22",     amount: 220, date: "2d ago" },
];

export const recentExpenses = [
  { id: "E-118", category: "Rent",        business: "Saffron Kitchen",    amount: 3200, date: "Nov 24" },
  { id: "E-117", category: "Salaries",    business: "Northwind Digital",  amount: 11800, date: "Nov 22" },
  { id: "E-116", category: "Inventory",   business: "WellCare Pharma",    amount: 2150, date: "Nov 21" },
  { id: "E-115", category: "Electricity", business: "Atelier 22",         amount: 410, date: "Nov 20" },
];

export const inventory = [
  { id: "P-001", name: "Saffron Risotto Kit", business: "Saffron Kitchen", category: "Food", qty: 8,  threshold: 12 },
  { id: "P-002", name: "Linen Co-ord Set",    business: "Atelier 22",      category: "Apparel", qty: 34, threshold: 10 },
  { id: "P-003", name: "Cashmere Scarf",      business: "Atelier 22",      category: "Apparel", qty: 6,  threshold: 8 },
  { id: "P-004", name: "Paracetamol 500mg",   business: "WellCare Pharma", category: "OTC",    qty: 142, threshold: 40 },
  { id: "P-005", name: "Vitamin D3 Drops",    business: "WellCare Pharma", category: "OTC",    qty: 12, threshold: 20 },
  { id: "P-006", name: "Truffle Oil 250ml",   business: "Saffron Kitchen", category: "Food",   qty: 4,  threshold: 10 },
];

export const employees = [
  { id: "U-01", name: "Aarav Mehta",     role: "Head Chef",       business: "Saffron Kitchen",    salary: 4800, status: "Active" },
  { id: "U-02", name: "Sana Iqbal",      role: "Store Manager",   business: "Atelier 22",         salary: 3600, status: "Active" },
  { id: "U-03", name: "Leon Whitaker",   role: "Creative Lead",   business: "Northwind Digital",  salary: 6800, status: "Active" },
  { id: "U-04", name: "Priya Raghavan",  role: "Pharmacist",      business: "WellCare Pharma",    salary: 4200, status: "On leave" },
  { id: "U-05", name: "Jonas Becker",    role: "Sous Chef",       business: "Saffron Kitchen",    salary: 3100, status: "Active" },
  { id: "U-06", name: "Mira Chen",       role: "Account Manager", business: "Northwind Digital",  salary: 4900, status: "Active" },
];

export const aiInsights = [
  { tone: "positive", title: "Northwind Digital is your growth engine", body: "Projected to grow 31% next month — consider reallocating 10% of ad budget here." },
  { tone: "warning",  title: "Saffron Kitchen food cost is creeping up", body: "Ingredient expenses rose 8.4% vs. last month. Review supplier contracts this week." },
  { tone: "neutral",  title: "Atelier 22 cashmere line is trending",   body: "Scarves sold out in 11 days. Forecast suggests a 22% revenue lift if restocked by Dec 5." },
];

export const notifications = [
  { id: "n1", tone: "warning",     title: "Low stock: Truffle Oil 250ml", time: "12m ago" },
  { id: "n2", tone: "destructive", title: "High expense alert — Salaries",  time: "1h ago" },
  { id: "n3", tone: "success",     title: "Monthly report is ready",         time: "3h ago" },
  { id: "n4", tone: "primary",     title: "AI: 15% sales growth predicted",  time: "Today" },
];

export const businessHealth = [
  { name: "Saffron Kitchen",   score: 74, label: "Healthy" },
  { name: "Atelier 22",         score: 82, label: "Healthy" },
  { name: "Northwind Digital",  score: 91, label: "Excellent" },
  { name: "WellCare Pharma",    score: 58, label: "Moderate" },
];

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
