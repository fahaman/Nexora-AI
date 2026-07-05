import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "violet" | "cyan" | "success" | "warning";

const variants: Record<Variant, string> = {
  primary: "bg-gradient-primary",
  violet: "bg-gradient-violet",
  cyan: "bg-gradient-cyan",
  success: "bg-gradient-success",
  warning: "bg-gradient-warning",
};

export function StatCard({
  label, value, delta, icon: Icon, variant = "primary", index = 0,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  variant?: Variant;
  index?: number;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card p-5"
    >
      <div className={cn("absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-25 blur-2xl", variants[variant])} />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-display font-semibold tracking-tight">{value}</div>
          {delta !== undefined && (
            <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10")}>
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(delta).toFixed(1)}% vs. last month
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl grid place-items-center text-white shadow-glow", variants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
