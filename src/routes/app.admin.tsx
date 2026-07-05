import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { authStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { adminApi, type AdminDashboardResponse } from "@/lib/api/endpoints";
import { Users, Building2, ShieldAlert, Activity, ArrowLeft, Loader2, Phone, FileText, Trash2, Plus, X, Award, AlertTriangle, BadgeAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const user = authStore.get().user;
      if (!user) throw redirect({ to: "/login" });
      if (user.email !== "admin@nexora.com") throw redirect({ to: "/app" });
    }
  },
  component: AdminPanel,
});

function AdminPanel() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [gst, setGst] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    adminApi
      .getDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load admin dashboard");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.addUser({
        name,
        email,
        password,
        role,
        phone,
        countryCode,
        gst: gst || undefined,
      });
      toast.success("User added successfully!");
      setIsModalOpen(false);
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("employee");
      setPhone("");
      setCountryCode("+91");
      setGst("");
      // Refresh
      fetchDashboardData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (userEmail === "admin@nexora.com") {
      toast.error("Cannot delete master admin account");
      return;
    }
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This will also delete all their businesses, sales, and employee data.`)) {
      return;
    }
    try {
      await adminApi.deleteUser(id);
      toast.success("User deleted successfully!");
      fetchDashboardData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12 text-center border border-destructive/20 bg-destructive/5 rounded-xl">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-lg font-semibold mt-4">Admin Dashboard Error</h2>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
        <Link to="/app" className="mt-6 inline-flex items-center gap-2 text-sm text-primary font-medium">
          <ArrowLeft className="w-4 h-4" /> Go back to app
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-muted-foreground mt-1">Manage global system metrics, registered users, and active businesses.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-lg bg-gradient-primary text-white shadow-glow text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
          <div className="flex gap-2 items-center px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-medium">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>System Healthy</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Users</p>
            <h3 className="text-xl font-bold mt-0.5">{data?.stats.totalUsers ?? 0}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Running</p>
            <h3 className="text-xl font-bold mt-0.5">{data?.stats.running ?? 0}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4 border-emerald-500/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground text-emerald-600 dark:text-emerald-400">Doing Well</p>
            <h3 className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">{data?.stats.doingWell ?? 0}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4 border-amber-500/20">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground text-amber-600 dark:text-amber-400">Consultancy Needs</p>
            <h3 className="text-xl font-bold mt-0.5 text-amber-600 dark:text-amber-400">{data?.stats.needsConsultancy ?? 0}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Access Role</p>
            <h3 className="text-sm font-bold mt-0.5 text-cyan-500">Master Admin</h3>
          </div>
        </div>
      </div>

      {/* Tables section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users Table */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20">
            <h2 className="text-lg font-semibold tracking-tight">System Users</h2>
            <p className="text-xs text-muted-foreground">Overview of registered user accounts and their contact info.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/10">
                  <th className="p-4">Name / Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {data?.users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10">
                    <td className="p-4">
                      <div className="font-medium text-foreground flex items-center gap-1.5">
                        {u.name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary capitalize font-medium">{u.role}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-4">
                      {u.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {u.countryCode} {u.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">No phone</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.gst ? (
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-mono text-xs uppercase bg-muted px-1.5 py-0.5 rounded border border-border">
                            {u.gst}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.email !== "admin@nexora.com" ? (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/15 text-destructive transition cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Businesses Table */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20">
            <h2 className="text-lg font-semibold tracking-tight">Active Businesses Health</h2>
            <p className="text-xs text-muted-foreground">Overview of all active businesses under the SaaS platform.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-medium bg-muted/10">
                  <th className="p-4">Business</th>
                  <th className="p-4">Owner Email</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Revenue / Profit</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {data?.businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/10">
                    <td className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{b.emoji}</span>
                      <div>
                        <span className="font-medium text-foreground">{b.name}</span>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide mt-0.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1 bg-${b.color || "violet"}-500`}
                          />
                          {b.color || "violet"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{b.ownerEmail}</td>
                    <td className="p-4">
                      <span className="bg-primary/5 text-primary text-xs px-2.5 py-1 rounded-full border border-primary/10 font-medium">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-display font-semibold">₹{(b as any).revenue?.toLocaleString() ?? 0}</div>
                      <div className={`text-xs ${(b as any).profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                        {(b as any).profit >= 0 ? "+" : ""}₹{(b as any).profit?.toLocaleString() ?? 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        (b as any).status === "Doing Well" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {(b as any).status === "Doing Well" ? <Award className="w-3 h-3" /> : <BadgeAlert className="w-3 h-3" />}
                        {(b as any).status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-card overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Add System User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg border border-border hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. John Doe"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="name@company.com"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} placeholder="Min 8 characters"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Country</label>
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="+91">IN (+91)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+61">AU (+61)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground">Phone Number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required placeholder="Phone number"
                    className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">GST Number (Optional)</label>
                <input value={gst} onChange={(e) => setGst(e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5"
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="h-10 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow cursor-pointer disabled:opacity-75">
                  {submitting ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
