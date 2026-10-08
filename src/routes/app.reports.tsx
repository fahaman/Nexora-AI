import { createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Download, FileText } from "lucide-react";
import { SafeResponsiveChart } from "@/components/safe-responsive-chart";
import { PageHeader, Panel } from "@/components/ui-bits";
import { useAppData, useAccurateMonthlySeries, fmt } from "@/lib/app-store";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — Nexora AI" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { businessId } = useAuth();
  const { businesses, sales, expenses } = useAppData();
  const series = useAccurateMonthlySeries(businessId);

  const compareData = businesses.map((b) => {
    const bizSales = sales.filter((s) => s.businessId === b.id || s.business === b.name);
    const bizExpenses = expenses.filter((e) => e.businessId === b.id || e.business === b.name);
    const rev = bizSales.reduce((sum, s) => sum + s.amount, 0);
    const exp = bizExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      name: b.name,
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
    };
  });

  const totalPortfolioRev = compareData.reduce((a, b) => a + b.revenue, 0);

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        subtitle="Revenue, expenses and net profit — calculated accurately for every business."
        action={
          <button
            onClick={() => toast.success("Portfolio financial report downloaded as PDF")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Revenue, expenses & profit">
          <div className="h-72">
            <SafeResponsiveChart>
              <AreaChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="ra" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.24 280)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.6 0.24 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0} />
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Revenue"
                  stroke="oklch(0.6 0.24 280)"
                  fill="url(#ra)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="oklch(0.72 0.18 155)"
                  fill="url(#rb)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </SafeResponsiveChart>
          </div>
        </Panel>

        <Panel title="Business comparison">
          {compareData.length === 0 ? (
            <div className="text-center py-20 text-xs text-muted-foreground">
              Add businesses to compare financial performance.
            </div>
          ) : (
            <div className="h-72">
              <SafeResponsiveChart>
                <BarChart data={compareData} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
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
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="oklch(0.6 0.24 280)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="oklch(0.78 0.17 75)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Profit"
                    fill="oklch(0.72 0.18 155)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </SafeResponsiveChart>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Generated reports" className="mt-4">
        <ul className="divide-y divide-border">
          {[
            { name: "Portfolio Executive Financial Summary", size: "1.2 MB" },
            { name: "Sales & Cashflow Statement", size: "640 KB" },
            { name: "Inventory & Expense Audit Report", size: "480 KB" },
          ].map((r) => (
            <li key={r.name} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary text-white grid place-items-center shadow-glow">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">PDF · {r.size}</div>
                </div>
              </div>
              <button
                onClick={() => toast.success(`Downloaded ${r.name}`)}
                className="text-sm text-primary font-medium hover:underline cursor-pointer"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-2 text-xs text-muted-foreground">
        Totals: {fmt(totalPortfolioRev)} revenue across portfolio.
      </div>
    </>
  );
}
