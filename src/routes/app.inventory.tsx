import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Package, AlertTriangle, Trash2, X } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-bits";
import { StatCard } from "@/components/stat-card";
import { cn } from "@/lib/utils";
import { useAppData, appStore, fmt } from "@/lib/app-store";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Nexora AI" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { businessId } = useAuth();
  const { inventory, businesses } = useAppData();
  const [q, setQ] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [qty, setQty] = useState("");
  const [threshold, setThreshold] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [selectedBizId, setSelectedBizId] = useState("");

  const isAll = !businessId || businessId === "all";
  const items = isAll
    ? inventory
    : inventory.filter((i) => i.businessId === businessId || i.business === businessId);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !qty || !unitPrice) return;

    const biz = businesses.find((b) => b.id === selectedBizId) ||
      businesses[0] || {
        id: "general",
        name: "General Store",
      };

    appStore.addInventoryItem({
      name,
      sku: sku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
      category: category || "General",
      qty: Number(qty),
      threshold: Number(threshold) || 10,
      unitPrice: Number(unitPrice),
      businessId: biz.id,
      business: biz.name,
    });

    toast.success(`Product "${name}" added to inventory!`);
    setIsModalOpen(false);
    setName("");
    setSku("");
    setCategory("");
    setQty("");
    setThreshold("");
    setUnitPrice("");
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from inventory?`)) return;
    appStore.deleteInventoryItem(id);
    toast.success(`Product "${name}" removed!`);
  };

  const filtered = items.filter((p) =>
    [p.name, p.category, p.sku].some((v) => v?.toLowerCase().includes(q.toLowerCase())),
  );

  const low = items.filter((p) => p.qty <= p.threshold).length;
  const categoriesCount = new Set(items.map((i) => i.category)).size;

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Per-business stock with smart low-stock alerts."
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
            <Plus className="w-4 h-4" /> Add product
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Products" value={String(items.length)} icon={Package} variant="cyan" />
        <StatCard label="Low stock" value={String(low)} icon={AlertTriangle} variant="warning" />
        <StatCard
          label="Categories"
          value={String(categoriesCount)}
          icon={Package}
          variant="violet"
        />
      </div>

      <Panel
        title="Products"
        className="mt-4"
        action={
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/60 border border-border w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="bg-transparent text-sm flex-1 focus:outline-none"
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p>No products in stock matching criteria.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary text-sm font-semibold mt-2 hover:underline cursor-pointer"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium">Product</th>
                  <th className="py-3 px-4 font-medium">Business</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Unit Price</th>
                  <th className="py-3 px-4 font-medium">Stock</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const isLow = p.qty <= p.threshold;
                  return (
                    <tr key={p.id} className="hover:bg-muted/5">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {p.sku || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.business}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.category}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {fmt(p.unitPrice)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="font-display font-semibold w-8">{p.qty}</span>
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                isLow ? "bg-gradient-warning" : "bg-gradient-success",
                              )}
                              style={{
                                width: `${Math.min(100, (p.qty / Math.max(1, p.threshold * 3)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                            isLow ? "bg-warning/15 text-warning" : "bg-success/15 text-success",
                          )}
                        >
                          {isLow ? "Low" : "OK"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-destructive/10 text-destructive bg-destructive/5 hover:bg-destructive/15 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Add Product</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Product Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Paracetamol 500mg"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  SKU / Barcode (Optional)
                </label>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. SKU-102938"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="e.g. Medicine, Groceries, Food"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Unit Price (INR)
                  </label>
                  <input
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    type="number"
                    required
                    placeholder="e.g. 150"
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Initial Qty
                  </label>
                  <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    type="number"
                    required
                    placeholder="e.g. 50"
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Low-stock Alert Threshold
                </label>
                <input
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  type="number"
                  required
                  placeholder="e.g. 10"
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
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
