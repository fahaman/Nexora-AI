import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, TrendingUp, Building2, X, Sparkles, Trash2 } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-bits";
import { useAppData, appStore, fmt } from "@/lib/app-store";
import { authStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/businesses")({
  head: () => ({ meta: [{ title: "Businesses — Nexora AI" }] }),
  component: BusinessesPage,
});

const tone = {
  violet: "bg-gradient-violet",
  cyan: "bg-gradient-cyan",
  success: "bg-gradient-success",
  warning: "bg-gradient-warning",
};

function BusinessesPage() {
  const navigate = useNavigate();
  const { businesses, sales, expenses } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [emoji, setEmoji] = useState("🏬");
  const [color, setColor] = useState<"violet" | "cyan" | "success" | "warning">("violet");

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBiz = appStore.addBusiness({
      name,
      category: category || "Retail & Services",
      emoji: emoji || "🏬",
      color,
    });

    toast.success(`Business "${newBiz.name}" created!`);
    setIsModalOpen(false);
    setName("");
    setCategory("");
    authStore.setBusiness(newBiz.id);
  };

  const handleDeleteBusiness = (id: string, bName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete business "${bName}" and all associated sales, expenses, and products?`,
      )
    )
      return;
    appStore.deleteBusiness(id);
    authStore.setBusiness("all");
    toast.success(`Business "${bName}" deleted`);
  };

  return (
    <>
      <PageHeader
        title="Your businesses"
        subtitle="Every business you manage from this workspace. Switch into any one to see scoped data."
        action={
          <div className="flex gap-2">
            {businesses.length === 0 && (
              <button
                onClick={() => appStore.loadDemoData()}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Load Demo Data
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add business
            </button>
          </div>
        }
      />

      {businesses.length === 0 ? (
        <div className="text-center py-16 px-4 border-2 border-dashed border-border rounded-2xl bg-card/40 my-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary/20 text-primary grid place-items-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight font-display">No businesses added yet</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            You haven't added any businesses to your portfolio yet. Create your first business below
            or load sample data to see Nexora AI in action.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-primary text-white font-medium shadow-glow text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create your first business
            </button>
            <button
              onClick={() => appStore.loadDemoData()}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-primary" /> Load Sample Demo Data
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {businesses.map((b, i) => {
            const bizSales = sales.filter((s) => s.businessId === b.id || s.business === b.name);
            const bizExpenses = expenses.filter(
              (e) => e.businessId === b.id || e.business === b.name,
            );
            const revenue = bizSales.reduce((sum, s) => sum + s.amount, 0);
            const expTotal = bizExpenses.reduce((sum, e) => sum + e.amount, 0);
            const profit = revenue - expTotal;
            const growth =
              expTotal > 0 ? (((revenue - expTotal) / expTotal) * 10).toFixed(1) : "0.0";

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card p-5"
              >
                <div
                  className={cn(
                    "absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-25 blur-2xl",
                    tone[b.color] || tone.violet,
                  )}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl grid place-items-center text-2xl shadow-glow text-white",
                      tone[b.color] || tone.violet,
                    )}
                  >
                    {b.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg font-semibold truncate">{b.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{b.category}</div>
                  </div>
                  <button className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5">
                  <Stat label="Revenue" value={fmt(revenue)} />
                  <Stat label="Profit" value={fmt(profit)} />
                  <Stat label="Growth" value={`${growth}%`} positive={Number(growth) >= 0} />
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => {
                      authStore.setBusiness(b.id);
                      toast.success(`Switched active view to ${b.name}`);
                      navigate({ to: "/app" });
                    }}
                    className="flex-1 h-10 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow cursor-pointer"
                  >
                    Open dashboard
                  </button>
                  <button
                    onClick={() => handleDeleteBusiness(b.id, b.name)}
                    className="h-10 px-3 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/15 transition cursor-pointer"
                    title="Delete business"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-border bg-card/50 hover:bg-card transition flex flex-col items-center justify-center min-h-[230px] text-muted-foreground cursor-pointer p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-muted grid place-items-center text-foreground">
              <Plus className="w-5 h-5" />
            </div>
            <div className="mt-3 font-medium text-foreground">Add new business</div>
            <div className="text-xs">Restaurant, retail, clinic, agency…</div>
          </button>
        </div>
      )}

      {businesses.length > 0 && (
        <Panel
          title="Portfolio comparison"
          className="mt-6"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="w-3 h-3" /> AI ranked
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2.5 px-3 font-medium">Business</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium">Revenue</th>
                  <th className="py-2.5 px-3 font-medium">Expenses</th>
                  <th className="py-2.5 px-3 font-medium">Net Profit</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {businesses.map((b) => {
                  const bizSales = sales.filter(
                    (s) => s.businessId === b.id || s.business === b.name,
                  );
                  const bizExpenses = expenses.filter(
                    (e) => e.businessId === b.id || e.business === b.name,
                  );
                  const revenue = bizSales.reduce((sum, s) => sum + s.amount, 0);
                  const expTotal = bizExpenses.reduce((sum, e) => sum + e.amount, 0);
                  const profit = revenue - expTotal;

                  return (
                    <tr key={b.id} className="hover:bg-muted/5">
                      <td className="py-3 px-3 font-medium">
                        {b.emoji} {b.name}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{b.category}</td>
                      <td className="py-3 px-3 font-semibold">{fmt(revenue)}</td>
                      <td className="py-3 px-3 text-muted-foreground">{fmt(expTotal)}</td>
                      <td
                        className={cn(
                          "py-3 px-3 font-semibold",
                          profit >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {fmt(profit)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                            profit >= 0
                              ? "bg-success/15 text-success"
                              : "bg-warning/15 text-warning",
                          )}
                        >
                          {profit >= 0 ? "Profitable" : "Operating"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Add Business Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Add New Business</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddBusiness} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Business Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Saffron Kitchen, Apex Tech"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Category / Industry
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="e.g. Restaurant, Clothing Shop, Pharmacy, Agency"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Emoji Icon
                  </label>
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="🏬">🏬 Retail / Shop</option>
                    <option value="🍜">🍜 Restaurant / Food</option>
                    <option value="👗">👗 Apparel / Fashion</option>
                    <option value="💻">💻 Tech / Agency</option>
                    <option value="💊">💊 Pharmacy / Clinic</option>
                    <option value="☕">☕ Cafe / Bakery</option>
                    <option value="🚗">🚗 Automotive / Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Accent Color
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value as any)}
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="violet">Violet</option>
                    <option value="cyan">Cyan</option>
                    <option value="success">Emerald</option>
                    <option value="warning">Amber</option>
                  </select>
                </div>
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
                  Add Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
