import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Search, ShoppingCart, DollarSign, TrendingUp, X, Trash2 } from "lucide-react";
import { SafeResponsiveChart } from "@/components/safe-responsive-chart";
import { PageHeader, Panel } from "@/components/ui-bits";
import { StatCard } from "@/components/stat-card";
import { useAppData, useAccurateMonthlySeries, appStore, fmt } from "@/lib/app-store";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sales")({
  head: () => ({ meta: [{ title: "Sales — Nexora AI" }] }),
  component: SalesPage,
});

function SalesPage() {
  const { businessId } = useAuth();
  const { sales, businesses, inventory } = useAppData();
  const series = useAccurateMonthlySeries(businessId);
  const [q, setQ] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBizId, setSelectedBizId] = useState("");
  const [date, setDate] = useState("Today");

  const isAll = !businessId || businessId === "all";
  const filteredSales = isAll
    ? sales
    : sales.filter((s) => s.businessId === businessId || s.business === businessId);

  const searched = filteredSales.filter((s) =>
    [s.product, s.business, s.id].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  const total = filteredSales.reduce((a, s) => a + s.amount, 0);
  const avg = filteredSales.length > 0 ? Math.round(total / filteredSales.length) : 0;

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || !amount) return;

    const biz = businesses.find((b) => b.id === selectedBizId) ||
      businesses[0] || {
        id: "general",
        name: "General Store",
      };

    appStore.addSale({
      product,
      businessId: biz.id,
      business: biz.name,
      amount: Number(amount),
      date: date || "Today",
    });

    toast.success(`Sale recorded: ₹${Number(amount).toLocaleString()} for ${product}`);
    setIsModalOpen(false);
    setProduct("");
    setAmount("");
  };

  const handleDeleteSale = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete sale transaction for "${name}"?`)) return;
    appStore.deleteSale(id);
    toast.success("Sale transaction deleted");
  };

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="Track every transaction across your portfolio in one stream."
        action={
          <button
            onClick={() => {
              if (businesses.length > 0) {
                setSelectedBizId(businessId === "all" ? businesses[0].id : businessId);
              }
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New sale
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={fmt(total)}
          icon={DollarSign}
          delta={12.4}
          variant="primary"
        />
        <StatCard
          label="Transactions"
          value={String(filteredSales.length)}
          icon={ShoppingCart}
          delta={4.1}
          variant="cyan"
        />
        <StatCard
          label="Avg. order"
          value={fmt(avg)}
          icon={TrendingUp}
          delta={2.6}
          variant="success"
        />
      </div>

      <Panel title="Sales trend" className="mt-4">
        <div className="h-64">
          <SafeResponsiveChart>
            <LineChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
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
              <Line
                type="monotone"
                dataKey="sales"
                stroke="oklch(0.6 0.24 280)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </SafeResponsiveChart>
        </div>
      </Panel>

      <Panel
        title="Transactions"
        className="mt-4"
        action={
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/60 border border-border w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sales…"
              className="bg-transparent text-sm flex-1 focus:outline-none"
            />
          </div>
        }
      >
        {searched.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p>No sales recorded yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary text-sm font-semibold mt-2 hover:underline cursor-pointer"
            >
              Record your first sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2.5 px-3 font-medium">ID</th>
                  <th className="py-2.5 px-3 font-medium">Product / Service</th>
                  <th className="py-2.5 px-3 font-medium">Business</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {searched.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/5">
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                    <td className="py-3 px-3 font-medium text-foreground">{s.product}</td>
                    <td className="py-3 px-3 text-muted-foreground">{s.business}</td>
                    <td className="py-3 px-3 text-muted-foreground">{s.date}</td>
                    <td className="py-3 px-3 text-right font-display font-semibold text-foreground">
                      {fmt(s.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteSale(s.id, s.product)}
                        className="p-1.5 rounded-lg border border-destructive/10 text-destructive bg-destructive/5 hover:bg-destructive/15 transition cursor-pointer"
                        title="Delete sale"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* New Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Record New Sale</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSale} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Product / Service Name
                </label>
                {inventory.length > 0 ? (
                  <input
                    list="inventory-suggestions"
                    value={product}
                    onChange={(e) => {
                      setProduct(e.target.value);
                      const matchedItem = inventory.find(
                        (i) => i.name.toLowerCase() === e.target.value.toLowerCase(),
                      );
                      if (matchedItem) {
                        setAmount(String(matchedItem.unitPrice));
                        setSelectedBizId(matchedItem.businessId);
                      }
                    }}
                    required
                    placeholder="Type or select product..."
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <input
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    required
                    placeholder="e.g. Tasting Menu, Consultation Fee"
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
                {inventory.length > 0 && (
                  <datalist id="inventory-suggestions">
                    {inventory.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.business} — ₹{item.unitPrice} ({item.qty} in stock)
                      </option>
                    ))}
                  </datalist>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Sale Amount (INR)
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Associated Business
                </label>
                <select
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                  required
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {businesses.length === 0 ? (
                    <option value="default">Default Business</option>
                  ) : (
                    businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.emoji} {biz.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Date / Period
                </label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Today"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
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
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
