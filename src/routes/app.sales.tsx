import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Search } from "lucide-react";
import { SafeResponsiveChart } from "@/components/safe-responsive-chart";
import { PageHeader, Panel } from "@/components/ui-bits";
import { StatCard } from "@/components/stat-card";
import { recentSales, salesSeries, fmt } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/sales")({
  head: () => ({ meta: [{ title: "Sales — Nexora AI" }] }),
  component: Sales,
});

function Sales() {
  const { businessId } = useAuth();
  const series = salesSeries(businessId);
  const [q, setQ] = useState("");
  const filtered = recentSales.filter((s) =>
    [s.product, s.business, s.id].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );
  const total = recentSales.reduce((a, s) => a + s.amount, 0);
  const avg = Math.round(total / recentSales.length);

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="Track every transaction across your portfolio in one stream."
        action={
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium">
            <Plus className="w-4 h-4" /> New sale
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Sales (30d)" value={fmt(total * 6)}    icon={DollarSign} delta={12.4} variant="primary" />
        <StatCard label="Transactions" value={String(recentSales.length * 6)} icon={ShoppingCart} delta={4.1} variant="cyan" />
        <StatCard label="Avg. order"   value={fmt(avg)} icon={TrendingUp} delta={2.6} variant="success" />
      </div>

      <Panel title="Sales trend" className="mt-4">
        <div className="h-64">
          <SafeResponsiveChart>
            <LineChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="sales" stroke="oklch(0.6 0.24 280)" strokeWidth={3} dot={false} />
            </LineChart>
          </SafeResponsiveChart>
        </div>
      </Panel>

      <Panel title="Transactions" className="mt-4"
        action={
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/60 border border-border w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sales…" className="bg-transparent text-sm flex-1 focus:outline-none" />
          </div>
        }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">ID</th>
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 pr-4 font-medium">Business</th>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{s.id}</td>
                  <td className="py-3 pr-4 font-medium">{s.product}</td>
                  <td className="py-3 pr-4">{s.business}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.date}</td>
                  <td className="py-3 pr-4 text-right font-display font-semibold">{fmt(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
