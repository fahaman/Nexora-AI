import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Building2,
  Users,
  Package,
  Sparkles,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { SafeResponsiveChart } from "@/components/safe-responsive-chart";
import { Panel, PageHeader } from "@/components/ui-bits";
import { useAuth } from "@/lib/auth-store";
import {
  useAppData,
  useCalculatedKpis,
  useDynamicAiInsights,
  useAccurateMonthlySeries,
  appStore,
  fmt,
} from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Overview — Nexora AI" }] }),
  component: OverviewPage,
});

const PIE_COLORS = [
  "oklch(0.6 0.25 295)",
  "oklch(0.7 0.18 220)",
  "oklch(0.72 0.18 155)",
  "oklch(0.78 0.17 75)",
  "oklch(0.65 0.2 30)",
];

function OverviewPage() {
  const { businessId } = useAuth();
  const { businesses, sales } = useAppData();
  const kpis = useCalculatedKpis(businessId);
  const aiInsights = useDynamicAiInsights(businessId);
  const series = useAccurateMonthlySeries(businessId);

  // Category share calculation for pie chart
  const bizTotals: Record<string, number> = {};
  sales.forEach((s) => {
    bizTotals[s.business] = (bizTotals[s.business] || 0) + s.amount;
  });

  const categoryShare = Object.entries(bizTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <>
      <PageHeader
        title="Welcome back, Owner 👋"
        subtitle="Here's how your portfolio is performing — across every business you own."
        action={
          businesses.length === 0 ? (
            <button
              onClick={() => appStore.loadDemoData()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Load Demo Data
            </button>
          ) : undefined
        }
      />

      {businesses.length === 0 && (
        <div className="mb-6 p-6 rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
                Start building your business portfolio
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Create your first business to track sales, expenses, inventory, and employees. AI
                will automatically calculate growth and provide smart recommendations.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to="/app/businesses"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Business
              </Link>
              <button
                onClick={() => appStore.loadDemoData()}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Load Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total revenue"
          value={fmt(kpis.revenue)}
          delta={kpis.growth}
          icon={DollarSign}
          variant="primary"
          index={0}
        />
        <StatCard
          label="Total expenses"
          value={fmt(kpis.expenses)}
          delta={-3.2}
          icon={TrendingDown}
          variant="warning"
          index={1}
        />
        <StatCard
          label="Net profit"
          value={fmt(kpis.profit)}
          delta={kpis.growth > 0 ? kpis.growth : 0}
          icon={TrendingUp}
          variant="success"
          index={2}
        />
        <StatCard
          label="Active businesses"
          value={String(kpis.businessCount)}
          icon={Building2}
          variant="cyan"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel
          title="Revenue vs. expenses"
          className="lg:col-span-2"
          action={
            <span className="text-xs text-muted-foreground">Dynamic Portfolio Performance</span>
          }
        >
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
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="oklch(0.6 0.24 280)"
                  strokeWidth={2.5}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="oklch(0.78 0.17 75)"
                  strokeWidth={2}
                  fill="url(#g2)"
                />
              </AreaChart>
            </SafeResponsiveChart>
          </div>
        </Panel>

        <Panel
          title="Revenue by business"
          action={<span className="text-xs text-muted-foreground">Mix %</span>}
        >
          {categoryShare.length === 0 ? (
            <div className="text-center py-20 text-xs text-muted-foreground">
              No sales data to display revenue mix.
            </div>
          ) : (
            <div className="h-72">
              <SafeResponsiveChart>
                <PieChart>
                  <Pie
                    data={categoryShare}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryShare.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </SafeResponsiveChart>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel
          title="AI insights"
          className="lg:col-span-2"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
              <Sparkles className="w-3 h-3" /> Nexora Intelligence
            </span>
          }
        >
          <div className="grid sm:grid-cols-3 gap-3">
            {aiInsights.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden rounded-xl border border-border p-4 bg-background"
              >
                <div
                  className={cn(
                    "absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40",
                    a.tone === "positive" && "bg-gradient-success",
                    a.tone === "warning" && "bg-gradient-warning",
                    a.tone === "neutral" && "bg-gradient-violet",
                  )}
                />
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {a.tone}
                </div>
                <div className="mt-1 font-medium text-sm">{a.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{a.body}</div>
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel title="Business health">
          {businesses.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              Add businesses to see health metrics.
            </div>
          ) : (
            <ul className="space-y-3">
              {businesses.map((b) => {
                const bizSales = sales.filter(
                  (s) => s.businessId === b.id || s.business === b.name,
                );
                const rev = bizSales.reduce((sum, s) => sum + s.amount, 0);
                const score = rev > 20000 ? 91 : rev > 5000 ? 75 : 60;
                const label = score >= 80 ? "Excellent" : score >= 70 ? "Healthy" : "Moderate";

                return (
                  <li key={b.id}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {b.emoji} {b.name}
                      </span>
                      <span className="text-muted-foreground">
                        {score}% · {label}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8 }}
                        className={cn(
                          "h-full rounded-full",
                          score >= 80
                            ? "bg-gradient-success"
                            : score >= 65
                              ? "bg-gradient-primary"
                              : "bg-gradient-warning",
                        )}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Monthly profit" className="lg:col-span-2">
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
                <Bar dataKey="profit" radius={[8, 8, 0, 0]} fill="oklch(0.7 0.18 220)" />
              </BarChart>
            </SafeResponsiveChart>
          </div>
        </Panel>

        <Panel
          title="Recent sales"
          action={
            <Link
              className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
              to="/app/sales"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          }
        >
          {sales.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              No recent sales recorded.
            </div>
          ) : (
            <ul className="space-y-3">
              {sales.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{s.product}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.business} · {s.date}
                    </div>
                  </div>
                  <div className="font-display font-semibold">{fmt(s.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <StatCard label="Employees" value={String(kpis.employees)} icon={Users} variant="violet" />
        <StatCard
          label="Inventory items"
          value={String(kpis.inventory)}
          icon={Package}
          variant="cyan"
        />
        <StatCard
          label="Growth (MoM)"
          value={`${kpis.growth}%`}
          delta={kpis.growth}
          icon={TrendingUp}
          variant="success"
        />
      </div>
    </>
  );
}
