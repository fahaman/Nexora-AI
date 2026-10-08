import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authStore } from "@/lib/auth-store";
import { apiConfigured } from "@/lib/api/client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Nexora AI" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [gst, setGst] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (apiConfigured() && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await authStore.register({
        email,
        password,
        name: name || "Owner",
        phone,
        countryCode,
        gst: gst || undefined,
      });
      toast.success("Account created — your workspace is being seeded");
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-6 order-2 md:order-1 my-auto">
        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card my-4"
        >
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Create your workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">14 days free. No card required.</p>

          {!apiConfigured() && (
            <div className="mt-4 p-3 rounded-lg border border-warning/40 bg-warning/10 text-xs text-warning flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Backend not configured. Set <code className="font-mono">VITE_API_URL</code>.
              </span>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <label className="block mt-6 text-xs font-medium text-muted-foreground">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <label className="block mt-4 text-xs font-medium text-muted-foreground">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-muted-foreground">Country</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="+91">IN (+91)</option>
                <option value="+1">US (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+61">AU (+61)</option>
                <option value="+971">AE (+971)</option>
                <option value="+49">DE (+49)</option>
                <option value="+33">FR (+33)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground">
                Phone number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                required
                placeholder="Phone number"
                className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <label className="block mt-4 text-xs font-medium text-muted-foreground">
            GST Number (Optional)
          </label>
          <input
            value={gst}
            onChange={(e) => setGst(e.target.value)}
            placeholder="e.g. 22AAAAA0000A1Z5"
            className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <label className="block mt-4 text-xs font-medium text-muted-foreground">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Min 8 characters. Hashed with bcrypt server-side.
          </p>

          <button
            disabled={loading}
            className="mt-6 w-full h-11 rounded-lg bg-gradient-primary text-white font-medium shadow-glow inline-flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              "Creating…"
            ) : (
              <>
                Create account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
      <div className="relative hidden md:block overflow-hidden order-1 md:order-2">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 p-10 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-2 self-end">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold">
              Nexora<span className="text-gradient">AI</span>
            </span>
          </Link>
          <div className="mt-auto">
            <h2 className="font-display text-4xl font-semibold tracking-tight max-w-md">
              From spreadsheets to a single command center.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md">
              Add restaurants, shops, agencies, clinics — Nexora handles them as one portfolio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
