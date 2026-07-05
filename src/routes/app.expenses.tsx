import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Receipt, AlertTriangle, TrendingDown } from "lucide-react";
import { SafeResponsiveChart } from "@/components/safe-responsive-chart";
import { PageHeader, Panel } from "@/components/ui-bits";
import { StatCard } from "@/components/stat-card";
import { recentExpenses, fmt, salesSeries } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Nexora AI" }] }),
  component: Expenses,
});

const categories = [
  { name: "Rent",        amount: 12400, color: "bg-gradient-violet" },
  { name: "Salaries",    amount: 38600, color: "bg-gradient-primary" },
  { name: "Inventory",   amount: 21800, color: "bg-gradient-cyan" },
  { name: "Electricity", amount: 3200,  color: "bg-gradient-warning" },
  { name: "Marketing",   amount: 9100,  color: "bg-gradient-success" },
];

function Expenses() {
  const { businessId } = useAuth();
  const series = salesSeries(businessId).map((s) => ({ month: s.month, expenses: s.expenses }));
  const total = categories.reduce((a, c) => a + c.amount, 0);

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Categorized expense tracking with budget signals."
        action={
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium">
            <Plus className="w-4 h-4" /> Add expense
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="This month"    value={fmt(total)}  icon={Receipt}      delta={-3.2} variant="warning" />
        <StatCard label="Biggest line"  value="Salaries"    icon={TrendingDown} variant="violet" />
        <StatCard label="Budget alerts" value="2"           icon={AlertTriangle} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Monthly expense trend" className="lg:col-span-2">
          <div className="h-64">
            <SafeResponsiveChart>
              <BarChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="expenses" radius={[8, 8, 0, 0]} fill="oklch(0.78 0.17 75)" />
              </BarChart>
            </SafeResponsiveChart>
          </div>
        </Panel>

        <Panel title="By category">
          <ul className="space-y-4">
            {categories.map((c) => {
              const pct = Math.round((c.amount / total) * 100);
              return (
                <li key={c.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{fmt(c.amount)} · {pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", c.color)} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Recent expenses" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">ID</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Business</th>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{e.id}</td>
                  <td className="py-3 pr-4 font-medium">{e.category}</td>
                  <td className="py-3 pr-4">{e.business}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{e.date}</td>
                  <td className="py-3 pr-4 text-right font-display font-semibold text-warning">{fmt(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
