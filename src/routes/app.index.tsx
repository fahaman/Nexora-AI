import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  DollarSign, TrendingDown, TrendingUp, Building2, Users, Package, Sparkles, ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { SafeResponsiveChart } from "@/components/safe-responsive-chart";
import { Panel, PageHeader } from "@/components/ui-bits";
import { useAuth } from "@/lib/auth-store";
import {
  kpis, salesSeries, categoryShare, recentSales, aiInsights, businessHealth, fmt,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Overview — Nexora AI" }] }),
  component: Overview,
});

const PIE_COLORS = ["oklch(0.6 0.25 295)", "oklch(0.7 0.18 220)", "oklch(0.72 0.18 155)", "oklch(0.78 0.17 75)"];

function Overview() {
  const { businessId } = useAuth();
  const k = kpis(businessId);
  const series = salesSeries(businessId);

  return (
    <>
      <PageHeader
        title="Welcome back, Owner 👋"
        subtitle="Here's how your portfolio is performing this month — across every business you own."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total revenue"  value={fmt(k.revenue)}  delta={k.growth}      icon={DollarSign}  variant="primary" index={0} />
        <StatCard label="Total expenses" value={fmt(k.expenses)} delta={-3.2}          icon={TrendingDown} variant="warning" index={1} />
        <StatCard label="Net profit"     value={fmt(k.profit)}   delta={k.growth - 4}  icon={TrendingUp}   variant="success" index={2} />
        <StatCard label="Active businesses" value={businessId === "all" ? "4" : "1"} icon={Building2} variant="cyan" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Revenue vs. expenses" className="lg:col-span-2"
          action={<span className="text-xs text-muted-foreground">Last 12 months</span>}>
          <div className="h-72">
            <SafeResponsiveChart>
              <AreaChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.24 280)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.6 0.24 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.17 75)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.17 75)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="sales" name="Sales"     stroke="oklch(0.6 0.24 280)" strokeWidth={2.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="oklch(0.78 0.17 75)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </SafeResponsiveChart>
          </div>
        </Panel>

        <Panel title="Revenue by business" action={<span className="text-xs text-muted-foreground">Mix %</span>}>
          <div className="h-72">
            <SafeResponsiveChart>
              <PieChart>
                <Pie data={categoryShare} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {categoryShare.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              </PieChart>
            </SafeResponsiveChart>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="AI insights" className="lg:col-span-2"
          action={<span className="inline-flex items-center gap-1 text-xs text-primary"><Sparkles className="w-3 h-3" /> Nexora Intelligence</span>}>
          <div className="grid sm:grid-cols-3 gap-3">
            {aiInsights.map((a, i) => (
              <motion.div key={a.title}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden rounded-xl border border-border p-4 bg-background"
              >
                <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40",
                  a.tone === "positive" && "bg-gradient-success",
                  a.tone === "warning"  && "bg-gradient-warning",
                  a.tone === "neutral"  && "bg-gradient-violet",
                )} />
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.tone}</div>
                <div className="mt-1 font-medium text-sm">{a.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{a.body}</div>
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel title="Business health">
          <ul className="space-y-3">
            {businessHealth.map((b) => (
              <li key={b.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{b.name}</span>
                  <span className="text-muted-foreground">{b.score}% · {b.label}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${b.score}%` }} transition={{ duration: 0.8 }}
                    className={cn("h-full rounded-full",
                      b.score >= 80 ? "bg-gradient-success" :
                      b.score >= 65 ? "bg-gradient-primary" :
                                      "bg-gradient-warning",
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Monthly profit" className="lg:col-span-2">
          <div className="h-64">
            <SafeResponsiveChart>
              <BarChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="profit" radius={[8, 8, 0, 0]} fill="oklch(0.7 0.18 220)" />
              </BarChart>
            </SafeResponsiveChart>
          </div>
        </Panel>

        <Panel title="Recent sales" action={<a className="text-xs text-primary inline-flex items-center gap-1" href="/app/sales">View all <ArrowUpRight className="w-3 h-3" /></a>}>
          <ul className="space-y-3">
            {recentSales.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{s.product}</div>
                  <div className="text-xs text-muted-foreground">{s.business} · {s.date}</div>
                </div>
                <div className="font-display font-semibold">{fmt(s.amount)}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <StatCard label="Employees"        value={String(k.employees)} icon={Users}   variant="violet" />
        <StatCard label="Inventory items"  value={String(k.inventory)} icon={Package} variant="cyan" />
        <StatCard label="Growth (MoM)"     value={`${k.growth}%`} delta={k.growth} icon={TrendingUp} variant="success" />
      </div>
    </>
  );
}
