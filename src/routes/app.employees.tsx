import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, Trash2, X, DollarSign, Calendar } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-bits";
import { StatCard } from "@/components/stat-card";
import { cn } from "@/lib/utils";
import { useAppData, appStore, fmt } from "@/lib/app-store";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/employees")({
  head: () => ({ meta: [{ title: "Employees — Nexora AI" }] }),
  component: EmployeesPage,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function EmployeesPage() {
  const { businessId } = useAuth();
  const { employees, businesses } = useAppData();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState<"Active" | "On leave" | "Inactive">("Active");
  const [selectedBizId, setSelectedBizId] = useState("");

  const isAll = !businessId || businessId === "all";
  const filteredEmployees = isAll
    ? employees
    : employees.filter((e) => e.businessId === businessId || e.business === businessId);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !salary) return;

    const biz = businesses.find((b) => b.id === selectedBizId) ||
      businesses[0] || {
        id: "general",
        name: "General Store",
      };

    appStore.addEmployee({
      name,
      role,
      salary: Number(salary),
      status,
      businessId: biz.id,
      business: biz.name,
    });

    toast.success(`Employee "${name}" added to ${biz.name}!`);
    setIsModalOpen(false);
    setName("");
    setRole("");
    setSalary("");
    setStatus("Active");
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete employee ${name}?`)) return;
    appStore.deleteEmployee(id);
    toast.success(`Employee "${name}" deleted!`);
  };

  const totalPayroll = filteredEmployees.reduce((a, e) => a + e.salary, 0);
  const onLeaveCount = filteredEmployees.filter((e) => e.status === "On leave").length;

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Roles, salaries and attendance across every business."
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
            <Plus className="w-4 h-4" /> Add employee
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Team size"
          value={String(filteredEmployees.length)}
          icon={Users}
          variant="violet"
        />
        <StatCard
          label="Monthly payroll"
          value={fmt(totalPayroll)}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard label="On leave" value={String(onLeaveCount)} icon={Calendar} variant="warning" />
      </div>

      <Panel title="Team" className="mt-4">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p>No employees registered yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary text-sm font-semibold mt-2 hover:underline cursor-pointer"
            >
              Add your first employee
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredEmployees.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-border p-4 bg-background flex items-start gap-3 relative group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-violet text-white grid place-items-center font-semibold shadow-glow shrink-0">
                  {initials(e.name)}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <div className="font-medium truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {e.role} · {e.business}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-display font-semibold">{fmt(e.salary)}/mo</span>
                    <span
                      className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full font-medium",
                        e.status === "Active" && "bg-emerald-500/10 text-emerald-500",
                        e.status === "On leave" && "bg-amber-500/10 text-amber-500",
                        e.status === "Inactive" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {e.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEmployee(e.id, e.name)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg border border-destructive/10 text-destructive bg-destructive/5 hover:bg-destructive/15 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Add Team Member</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Sana Iqbal"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Job Title / Role
                </label>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  placeholder="e.g. Store Manager"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Monthly Salary (INR)
                </label>
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  type="number"
                  required
                  placeholder="e.g. 25000"
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
                <label className="block text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Active">Active</option>
                  <option value="On leave">On leave</option>
                  <option value="Inactive">Inactive</option>
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
