import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Brain, Activity } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-bits";
import { businessHealth, aiInsights, kpis, businesses, fmt } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — Nexora AI" }] }),
  component: AIInsights,
});

function AIInsights() {
  const predictions = businesses.filter((b) => b.id !== "all").map((b) => {
    const k = kpis(b.id);
    const predicted = Math.round(k.revenue * (1 + (k.growth / 100)));
    return { ...b, current: k.revenue, predicted, lift: ((predicted - k.revenue) / k.revenue) * 100 };
  });

  return (
    <>
      <PageHeader
        title="Nexora Intelligence"
        subtitle="AI-powered predictions, smart suggestions and business health scores."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {aiInsights.map((a, i) => (
          <motion.div key={a.title}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30",
              a.tone === "positive" && "bg-gradient-success",
              a.tone === "warning"  && "bg-gradient-warning",
              a.tone === "neutral"  && "bg-gradient-violet",
            )} />
            <div className="inline-flex items-center gap-1 text-xs text-primary"><Sparkles className="w-3 h-3" /> Insight</div>
            <h3 className="mt-1 font-display text-lg font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            <button className="mt-4 text-xs font-medium text-primary hover:underline">View details →</button>
          </motion.div>
        ))}
      </div>

      <Panel title="Sales prediction (next 30 days)" className="mt-4"
        action={<span className="inline-flex items-center gap-1 text-xs text-primary"><Brain className="w-3 h-3" /> ML model</span>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {predictions.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border p-4 bg-background flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary grid place-items-center text-2xl shadow-glow">{p.emoji}</div>
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">Current: {fmt(p.current)} → Predicted: <span className="text-foreground font-medium">{fmt(p.predicted)}</span></div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                  <TrendingUp className="w-4 h-4" /> +{p.lift.toFixed(1)}%
                </div>
                <div className="text-[11px] text-muted-foreground">confidence 87%</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Panel title="Business health scores"
          action={<span className="inline-flex items-center gap-1 text-xs text-primary"><Activity className="w-3 h-3" /> Live</span>}>
          <ul className="space-y-4">
            {businessHealth.map((b) => (
              <li key={b.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{b.name}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs",
                    b.score >= 80 ? "bg-success/15 text-success" :
                    b.score >= 65 ? "bg-primary/15 text-primary" :
                                    "bg-warning/15 text-warning",
                  )}>{b.score}% · {b.label}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.score}%` }} transition={{ duration: 0.9 }}
                    className={cn("h-full rounded-full",
                      b.score >= 80 ? "bg-gradient-success" :
                      b.score >= 65 ? "bg-gradient-primary" :
                                      "bg-gradient-warning",
                    )} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recommended actions"
          action={<span className="inline-flex items-center gap-1 text-xs text-warning"><AlertTriangle className="w-3 h-3" /> Prioritized</span>}>
          <ol className="space-y-3 text-sm">
            {[
              "Reorder Truffle Oil 250ml for Saffron Kitchen by Friday.",
              "Renegotiate ingredient supplier for Saffron Kitchen (–6% est. savings).",
              "Reallocate 10% of agency ad spend to Northwind Digital.",
              "Restock cashmere scarves at Atelier 22 before Dec 5.",
              "Review WellCare Pharma payroll vs. revenue ratio.",
            ].map((t, i) => (
              <li key={t} className="flex items-start gap-3 rounded-lg border border-border p-3 bg-background">
                <div className="w-7 h-7 rounded-lg bg-gradient-primary text-white font-semibold text-xs grid place-items-center shadow-glow">{i + 1}</div>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
