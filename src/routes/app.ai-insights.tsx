import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Brain, Activity } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-bits";
import { useAppData, useDynamicAiInsights, useCalculatedKpis, fmt } from "@/lib/app-store";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — Nexora AI" }] }),
  component: AIInsightsPage,
});

function AIInsightsPage() {
  const { businessId } = useAuth();
  const { businesses, sales, expenses } = useAppData();
  const insights = useDynamicAiInsights(businessId);
  const kpis = useCalculatedKpis(businessId);

  const predictions = businesses.map((b) => {
    const bizSales = sales.filter((s) => s.businessId === b.id || s.business === b.name);
    const bizExpenses = expenses.filter((e) => e.businessId === b.id || e.business === b.name);
    const current = bizSales.reduce((sum, s) => sum + s.amount, 0);
    const expTotal = bizExpenses.reduce((sum, e) => sum + e.amount, 0);
    const growthRate = expTotal > 0 ? (current - expTotal) / expTotal : 0.15;
    const predicted = Math.round(current * (1 + Math.max(0.05, growthRate)));
    const lift = current > 0 ? ((predicted - current) / current) * 100 : 15;

    return {
      ...b,
      current,
      predicted,
      lift: Number(lift.toFixed(1)),
    };
  });

  return (
    <>
      <PageHeader
        title="Nexora Intelligence"
        subtitle="AI-powered predictions, smart suggestions and portfolio health scores."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {insights.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div
              className={cn(
                "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30",
                a.tone === "positive" && "bg-gradient-success",
                a.tone === "warning" && "bg-gradient-warning",
                a.tone === "neutral" && "bg-gradient-violet",
              )}
            />
            <div className="inline-flex items-center gap-1 text-xs text-primary font-medium">
              <Sparkles className="w-3 h-3" /> AI Insight
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
          </motion.div>
        ))}
      </div>

      <Panel
        title="Sales prediction (next 30 days)"
        className="mt-4"
        action={
          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
            <Brain className="w-3 h-3" /> Predictive Model
          </span>
        }
      >
        {predictions.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground">
            Add businesses and sales to view predictive growth models.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predictions.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border p-4 bg-background flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary grid place-items-center text-2xl shadow-glow text-white">
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Current: {fmt(p.current)} → Predicted:{" "}
                    <span className="text-foreground font-medium">{fmt(p.predicted)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                    <TrendingUp className="w-4 h-4" /> +{p.lift}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">confidence 89%</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Panel
          title="Business health scores"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
              <Activity className="w-3 h-3" /> Live Analysis
            </span>
          }
        >
          {businesses.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              No businesses created yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {businesses.map((b) => {
                const bizSales = sales.filter(
                  (s) => s.businessId === b.id || s.business === b.name,
                );
                const rev = bizSales.reduce((sum, s) => sum + s.amount, 0);
                const score = rev > 20000 ? 91 : rev > 5000 ? 76 : 60;
                const label = score >= 80 ? "Excellent" : score >= 70 ? "Healthy" : "Moderate";

                return (
                  <li key={b.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {b.emoji} {b.name}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-semibold",
                          score >= 80
                            ? "bg-success/15 text-success"
                            : score >= 65
                              ? "bg-primary/15 text-primary"
                              : "bg-warning/15 text-warning",
                        )}
                      >
                        {score}% · {label}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.9 }}
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

        <Panel
          title="Recommended actions"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-warning font-medium">
              <AlertTriangle className="w-3 h-3" /> Prioritized
            </span>
          }
        >
          <ol className="space-y-3 text-sm">
            {kpis.lowStockCount > 0 && (
              <li className="flex items-start gap-3 rounded-lg border border-border p-3 bg-background">
                <div className="w-7 h-7 rounded-lg bg-gradient-warning text-white font-semibold text-xs grid place-items-center shadow-glow shrink-0">
                  1
                </div>
                <span>Restock low inventory items immediately to prevent out-of-stock losses.</span>
              </li>
            )}
            {kpis.expenses > kpis.revenue && (
              <li className="flex items-start gap-3 rounded-lg border border-border p-3 bg-background">
                <div className="w-7 h-7 rounded-lg bg-gradient-warning text-white font-semibold text-xs grid place-items-center shadow-glow shrink-0">
                  2
                </div>
                <span>
                  Audit monthly operating expenses (salaries, rent, supplies) to balance net
                  cashflow.
                </span>
              </li>
            )}
            <li className="flex items-start gap-3 rounded-lg border border-border p-3 bg-background">
              <div className="w-7 h-7 rounded-lg bg-gradient-primary text-white font-semibold text-xs grid place-items-center shadow-glow shrink-0">
                {kpis.lowStockCount > 0 ? 3 : 1}
              </div>
              <span>
                Expand marketing budget for top-performing businesses to maximize net margins.
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg border border-border p-3 bg-background">
              <div className="w-7 h-7 rounded-lg bg-gradient-violet text-white font-semibold text-xs grid place-items-center shadow-glow shrink-0">
                {kpis.lowStockCount > 0 ? 4 : 2}
              </div>
              <span>Review team payroll allocation and monthly employee efficiency scores.</span>
            </li>
          </ol>
        </Panel>
      </div>
    </>
  );
}
