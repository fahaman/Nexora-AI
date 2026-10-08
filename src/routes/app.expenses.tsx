import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Receipt, AlertTriangle, TrendingDown, X, Trash2 } from "lucide-react";
import { SafeResponsiveChart } from "@/components/safe-responsive-chart";
import { PageHeader, Panel } from "@/components/ui-bits";
import { StatCard } from "@/components/stat-card";
import { useAppData, useAccurateMonthlySeries, appStore, fmt } from "@/lib/app-store";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Nexora AI" }] }),
  component: ExpensesPage,
});

const CATEGORY_COLORS: Record<string, string> = {
  Rent: "bg-gradient-violet",
  Salaries: "bg-gradient-primary",
  Inventory: "bg-gradient-cyan",
  Electricity: "bg-gradient-warning",
  Marketing: "bg-gradient-success",
  Maintenance: "bg-amber-500",
  Other: "bg-slate-500",
};

function ExpensesPage() {
  const { businessId } = useAuth();
  const { expenses, businesses } = useAppData();
  const series = useAccurateMonthlySeries(businessId);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState("Salaries");
  const [amount, setAmount] = useState("");
  const [selectedBizId, setSelectedBizId] = useState("");
  const [date, setDate] = useState("Today");

  const isAll = !businessId || businessId === "all";
  const filteredExpenses = isAll
    ? expenses
    : expenses.filter((e) => e.businessId === businessId || e.business === businessId);

  const total = filteredExpenses.reduce((a, e) => a + e.amount, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categoryList = Object.entries(categoryTotals).map(([name, amt]) => ({
    name,
    amount: amt,
    color: CATEGORY_COLORS[name] || "bg-gradient-primary",
  }));

  const biggestLine = categoryList.sort((a, b) => b.amount - a.amount)[0]?.name || "None";
  const budgetAlerts = filteredExpenses.filter((e) => e.amount >= 50000).length;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const biz = businesses.find((b) => b.id === selectedBizId) ||
      businesses[0] || {
        id: "general",
        name: "General Store",
      };

    appStore.addExpense({
      category,
      businessId: biz.id,
      business: biz.name,
      amount: Number(amount),
      date: date || "Today",
    });

    toast.success("Expense recorded successfully");
    setIsModalOpen(false);
    setAmount("");
  };

  const handleDeleteExpense = (id: string, cat: string) => {
    if (!confirm(`Are you sure you want to delete expense entry for "${cat}"?`)) return;
    appStore.deleteExpense(id);
    toast.success("Expense deleted");
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Categorized expense tracking with dynamic budget signals."
        action={
          <button
            onClick={() => {
              if (businesses.length > 0) {
                setSelectedBizId(businessId === "all" ? businesses[0].id : businessId);
              }
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add expense
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Expenses"
          value={fmt(total)}
          icon={Receipt}
          delta={-3.2}
          variant="warning"
        />
        <StatCard label="Biggest line" value={biggestLine} icon={TrendingDown} variant="violet" />
        <StatCard
          label="Budget alerts"
          value={String(budgetAlerts)}
          icon={AlertTriangle}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Monthly expense trend" className="lg:col-span-2">
          <div className="h-64">
            <SafeResponsiveChart>
              <BarChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="expenses" radius={[8, 8, 0, 0]} fill="oklch(0.78 0.17 75)" />
              </BarChart>
            </SafeResponsiveChart>
          </div>
        </Panel>

        <Panel title="By category">
          {categoryList.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              No expenses recorded yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {categoryList.map((c) => {
                const pct = total > 0 ? Math.round((c.amount / total) * 100) : 0;
                return (
                  <li key={c.name}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">
                        {fmt(c.amount)} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", c.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent expenses" className="mt-4">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p>No expenses recorded yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary text-sm font-semibold mt-2 hover:underline cursor-pointer"
            >
              Add your first expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2.5 px-3 font-medium">ID</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium">Business</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/5">
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{e.id}</td>
                    <td className="py-3 px-3 font-medium">{e.category}</td>
                    <td className="py-3 px-3 text-muted-foreground">{e.business}</td>
                    <td className="py-3 px-3 text-muted-foreground">{e.date}</td>
                    <td className="py-3 px-3 text-right font-display font-semibold text-warning">
                      {fmt(e.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(e.id, e.category)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Record Expense</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Salaries">Salaries & Payroll</option>
                  <option value="Rent">Rent & Lease</option>
                  <option value="Inventory">Inventory & Supplies</option>
                  <option value="Electricity">Utilities & Electricity</option>
                  <option value="Marketing">Marketing & Ads</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Expense Amount (INR)
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  required
                  placeholder="e.g. 12000"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Associated Business
                </label>
                <select
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                  required
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {businesses.length === 0 ? (
                    <option value="default">Default Business</option>
                  ) : (
                    businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.emoji} {biz.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Date / Period
                </label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Today"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
