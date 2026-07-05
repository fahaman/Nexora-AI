import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, BarChart3, Brain, Building2, Shield, ArrowRight,
  ShoppingCart, Receipt, Package, Users, Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora AI — Run every business from one intelligent dashboard" },
      { name: "description", content: "Nexora AI is the AI-powered SaaS that lets owners manage multiple businesses — sales, expenses, inventory, employees and AI insights — from a single command center." },
      { property: "og:title", content: "Nexora AI — Multi-business management, powered by AI" },
      { property: "og:description", content: "One owner. Many businesses. Zero spreadsheets." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary shadow-glow grid place-items-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-lg">Nexora<span className="text-gradient">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#ai" className="hover:text-foreground">AI</a>
            <a href="#preview" className="hover:text-foreground">Preview</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm px-3 py-2 rounded-lg hover:bg-muted">Sign in</Link>
            <Link to="/register" className="text-sm px-4 py-2 rounded-lg bg-gradient-primary text-white shadow-glow">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI-powered multi-business operating system
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="mt-6 font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
          >
            Run every business <br />
            from <span className="text-gradient">one intelligent</span> dashboard.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="mt-6 max-w-2xl mx-auto text-muted-foreground text-lg"
          >
            Sales, expenses, inventory, employees and AI forecasts for every business you own —
            unified in a single command center. Built for owners who refuse to live in spreadsheets.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Link to="/register" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white shadow-glow font-medium">
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/app" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted font-medium">
              View live demo
            </Link>
          </motion.div>

          {/* Dashboard preview mock */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
            id="preview"
            className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-border bg-card shadow-glow overflow-hidden"
          >
            <div className="h-9 flex items-center gap-1.5 px-4 border-b border-border bg-muted/50">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
              <span className="ml-3 text-xs text-muted-foreground">app.nexora.ai</span>
            </div>
            <div className="grid md:grid-cols-4 gap-4 p-6">
              {[
                { l: "Revenue", v: "$184,320", g: "bg-gradient-primary" },
                { l: "Expenses", v: "$92,110", g: "bg-gradient-warning" },
                { l: "Profit", v: "$92,210", g: "bg-gradient-success" },
                { l: "Businesses", v: "4 active", g: "bg-gradient-cyan" },
              ].map((c) => (
                <div key={c.l} className="relative rounded-xl border border-border p-4 overflow-hidden">
                  <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-30 blur-2xl ${c.g}`} />
                  <div className="text-xs text-muted-foreground">{c.l}</div>
                  <div className="mt-1 font-display text-2xl font-semibold">{c.v}</div>
                </div>
              ))}
              <div className="md:col-span-4 rounded-xl border border-border h-48 grid-bg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight">Everything an owner needs. None of the bloat.</h2>
          <p className="mt-3 text-muted-foreground">Built for portfolio operators running restaurants, retail, agencies, clinics and more — all from the same login.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Building2, title: "Multi-business switcher", body: "Each business keeps its own sales, expenses, team and inventory — switch in one click." },
            { icon: ShoppingCart, title: "Sales tracking", body: "Daily and monthly sales, product breakdowns, and live trend lines." },
            { icon: Receipt, title: "Expense control", body: "Categorized expenses with alerts when categories overshoot their budget." },
            { icon: Package, title: "Inventory + alerts", body: "Stock thresholds, low-stock badges and reorder suggestions per business." },
            { icon: Users, title: "Employees & roles", body: "Salaries, attendance and role-based access for managers and staff." },
            { icon: BarChart3, title: "Reports & analytics", body: "Profit, growth and head-to-head business comparisons in one view." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-glow transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-primary text-white grid place-items-center shadow-glow">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="relative">
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
              <Brain className="w-3.5 h-3.5 text-primary" /> Nexora Intelligence
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight">AI that actually understands your portfolio.</h2>
            <p className="mt-3 text-muted-foreground">Forecast next month's sales, get warned about creeping costs, and see which business deserves more of your budget — all without touching a model.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Per-business sales prediction for the next 30 days",
                "Health score: Healthy · Moderate · Risky",
                "Suggested actions ranked by projected ROI",
                "Cross-business comparisons in plain English",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-1 w-5 h-5 rounded-md bg-gradient-primary grid place-items-center shadow-glow">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            {[
              { tone: "bg-gradient-success", title: "Sales may increase 15% next month", body: "Northwind Digital trending up — reallocate ad budget by Friday." },
              { tone: "bg-gradient-warning", title: "Food cost creeping at Saffron Kitchen", body: "Ingredient spend +8.4% vs. last month. Review suppliers." },
              { tone: "bg-gradient-violet",  title: "Restock cashmere by Dec 5", body: "Atelier 22 will lose ~$4.2k otherwise — based on velocity model." },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 blur-2xl ${c.tone}`} />
                <div className="text-xs uppercase tracking-wider text-muted-foreground">AI insight</div>
                <div className="mt-1 font-display text-lg font-semibold">{c.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="font-display text-4xl font-semibold tracking-tight max-w-2xl">Owners who replaced 6 dashboards with Nexora.</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { q: "I run a restaurant, a boutique and a clinic. Nexora is the first tool that treats that as normal.", n: "Aarav M.", r: "Portfolio Owner" },
            { q: "The AI insights flagged a supplier issue weeks before our accountant did.", n: "Sana I.", r: "Founder, Atelier 22" },
            { q: "Switching businesses used to mean switching apps. Now it's a single click.", n: "Leon W.", r: "CEO, Northwind Digital" },
          ].map((t) => (
            <div key={t.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-sm">"{t.q}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-violet" />
                <div>
                  <div className="text-sm font-medium">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-border p-10 md:p-14 text-center bg-card">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="relative">
            <Shield className="w-8 h-8 mx-auto text-primary" />
            <h3 className="mt-4 font-display text-3xl md:text-4xl font-semibold">One login. Every business. Unfair clarity.</h3>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">14-day trial. No card required. Bring as many businesses as you own.</p>
            <Link to="/register" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white shadow-glow font-medium">
              Create your workspace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-primary grid place-items-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            © {new Date().getFullYear()} Nexora AI
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
