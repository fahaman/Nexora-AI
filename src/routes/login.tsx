import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authStore } from "@/lib/auth-store";
import { apiConfigured } from "@/lib/api/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Nexora AI" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authStore.login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="relative hidden md:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 p-10 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold">Nexora<span className="text-gradient">AI</span></span>
          </Link>
          <div className="mt-auto">
            <h2 className="font-display text-4xl font-semibold tracking-tight max-w-md">One login for every business you run.</h2>
            <p className="mt-3 text-muted-foreground max-w-md">Sales, expenses, inventory, employees, AI insights — for every business, from one dashboard.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your Nexora workspace.</p>

          {!apiConfigured() && (
            <div className="mt-4 p-3 rounded-lg border border-warning/40 bg-warning/10 text-xs text-warning flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Backend not configured. Set <code className="font-mono">VITE_API_URL</code>. Demo mode allows any credentials.</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <label className="block mt-6 text-xs font-medium text-muted-foreground">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email"
            className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />

          <label className="block mt-4 text-xs font-medium text-muted-foreground">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" minLength={apiConfigured() ? 8 : 1}
            className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />

          <button disabled={loading} className="mt-6 w-full h-11 rounded-lg bg-gradient-primary text-white font-medium shadow-glow inline-flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? "Signing in…" : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
          </button>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            New here? <Link to="/register" className="text-primary font-medium">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
