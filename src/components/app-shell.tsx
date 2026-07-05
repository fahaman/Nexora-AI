import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Building2, ShoppingCart, Receipt, Package,
  Users, BarChart3, Settings, Sparkles, Bell, Search, LogOut, Moon, Sun, ShieldAlert
} from "lucide-react";
import { useEffect, useState } from "react";
import { authStore, useAuth } from "@/lib/auth-store";
import { businesses, notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/businesses", label: "Businesses", icon: Building2 },
  { to: "/app/sales", label: "Sales", icon: ShoppingCart },
  { to: "/app/expenses", label: "Expenses", icon: Receipt },
  { to: "/app/inventory", label: "Inventory", icon: Package },
  { to: "/app/employees", label: "Employees", icon: Users },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
  { to: "/app/ai-insights", label: "AI Insights", icon: Sparkles },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, businessId } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexora.theme");
      if (saved) return saved === "dark";
    }
    return true;
  });
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nexora.theme", dark ? "dark" : "light");
  }, [dark]);

  const userInitials = user?.name ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() : "U";
  const activeBiz = businesses.find((b) => b.id === businessId) ?? businesses[0];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0 h-screen">
        <Link to="/" className="px-6 h-16 flex items-center gap-2 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary shadow-glow grid place-items-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Nexora<span className="text-gradient">AI</span></span>
        </Link>

        <div className="px-3 py-4">
          <div className="px-3 text-[11px] uppercase tracking-wider text-sidebar-foreground/50 mb-2">Active business</div>
          <select
            value={businessId}
            onChange={(e) => authStore.setBusiness(e.target.value)}
            className="w-full bg-sidebar-accent/60 text-sidebar-foreground border border-sidebar-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.emoji}  {b.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {(user?.email === "admin@nexora.com"
            ? [...navItems, { to: "/app/admin", label: "Admin Panel", icon: ShieldAlert }]
            : navItems
          ).map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sb-active"
                    className="absolute inset-0 rounded-lg bg-gradient-primary opacity-90 -z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <item.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => { authStore.logout(); navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/70 backdrop-blur-xl flex items-center gap-3 px-4 lg:px-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-violet grid place-items-center text-white font-semibold shadow-soft shrink-0">
            {userInitials}
          </div>
          <div className="lg:hidden font-display font-semibold text-gradient">NexoraAI</div>
          <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-lg bg-muted/60 border border-border w-full max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input placeholder="Search sales, products, employees…" className="bg-transparent text-sm flex-1 focus:outline-none" />
            <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-lg border border-border bg-card">
              <span className="text-lg leading-none">{activeBiz.emoji}</span>
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">Viewing</div>
                <div className="text-sm font-medium">{activeBiz.name}</div>
              </div>
            </div>
            <button onClick={() => setDark((d) => !d)} className="w-10 h-10 grid place-items-center rounded-lg border border-border hover:bg-muted cursor-pointer">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="relative">
              <button onClick={() => setNotifOpen((o) => !o)} className="w-10 h-10 grid place-items-center rounded-lg border border-border hover:bg-muted relative cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
              </button>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 rounded-xl glass shadow-card p-2 z-40"
                >
                  <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">Notifications</div>
                  {notifications.map((n) => (
                    <div key={n.id} className="px-3 py-2 rounded-lg hover:bg-muted/60 flex gap-3 items-start">
                      <span className={cn("mt-1.5 w-2 h-2 rounded-full",
                        n.tone === "warning" && "bg-warning",
                        n.tone === "destructive" && "bg-destructive",
                        n.tone === "success" && "bg-success",
                        n.tone === "primary" && "bg-primary",
                      )} />
                      <div className="flex-1">
                        <div className="text-sm">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
