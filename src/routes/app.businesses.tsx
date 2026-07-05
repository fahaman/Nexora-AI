import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, TrendingUp } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-bits";
import { businesses, kpis, fmt } from "@/lib/mock-data";
import { authStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/businesses")({
  head: () => ({ meta: [{ title: "Businesses — Nexora AI" }] }),
  component: Businesses,
});

const tone = {
  violet: "bg-gradient-violet",
  cyan: "bg-gradient-cyan",
  success: "bg-gradient-success",
  warning: "bg-gradient-warning",
};

function Businesses() {
  const list = businesses.filter((b) => b.id !== "all");
  return (
    <>
      <PageHeader
        title="Your businesses"
        subtitle="Every business you manage from this workspace. Switch into any one to see scoped data."
        action={
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium">
            <Plus className="w-4 h-4" /> Add business
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((b, i) => {
          const k = kpis(b.id);
          return (
            <motion.div key={b.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card p-5"
            >
              <div className={cn("absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-25 blur-2xl", tone[b.color])} />
              <div className="relative flex items-start gap-3">
                <div className={cn("w-12 h-12 rounded-xl grid place-items-center text-2xl shadow-glow text-white", tone[b.color])}>{b.emoji}</div>
                <div className="flex-1">
                  <div className="font-display text-lg font-semibold">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.category}</div>
                </div>
                <button className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5">
                <Stat label="Revenue"  value={fmt(k.revenue)} />
                <Stat label="Profit"   value={fmt(k.profit)} />
                <Stat label="Growth"   value={`${k.growth}%`} positive />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => authStore.setBusiness(b.id)}
                  className="flex-1 h-10 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow"
                >
                  Open dashboard
                </button>
                <button className="h-10 px-3 rounded-lg border border-border text-sm hover:bg-muted">Edit</button>
              </div>
            </motion.div>
          );
        })}

        <button className="rounded-2xl border-2 border-dashed border-border bg-card/50 hover:bg-card transition flex flex-col items-center justify-center min-h-[230px] text-muted-foreground">
          <div className="w-12 h-12 rounded-xl bg-muted grid place-items-center"><Plus className="w-5 h-5" /></div>
          <div className="mt-3 font-medium text-foreground">Add new business</div>
          <div className="text-xs">Restaurant, retail, clinic, agency…</div>
        </button>
      </div>

      <Panel title="Portfolio comparison" className="mt-4"
        action={<span className="inline-flex items-center gap-1 text-xs text-primary"><TrendingUp className="w-3 h-3" /> AI ranked</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Business</th>
                <th className="py-2 pr-4 font-medium">Revenue</th>
                <th className="py-2 pr-4 font-medium">Expenses</th>
                <th className="py-2 pr-4 font-medium">Profit</th>
                <th className="py-2 pr-4 font-medium">Growth</th>
                <th className="py-2 pr-4 font-medium">Health</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const k = kpis(b.id);
                const health = Math.min(99, 50 + Math.round(k.growth * 1.3));
                return (
                  <tr key={b.id} className="border-t border-border">
                    <td className="py-3 pr-4 font-medium">{b.emoji} {b.name}</td>
                    <td className="py-3 pr-4">{fmt(k.revenue)}</td>
                    <td className="py-3 pr-4">{fmt(k.expenses)}</td>
                    <td className="py-3 pr-4 text-success">{fmt(k.profit)}</td>
                    <td className="py-3 pr-4">+{k.growth}%</td>
                    <td className="py-3 pr-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs",
                        health >= 80 ? "bg-success/15 text-success" :
                        health >= 65 ? "bg-primary/15 text-primary" :
                                       "bg-warning/15 text-warning",
                      )}>{health}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("font-display font-semibold", positive && "text-success")}>{value}</div>
    </div>
  );
}
