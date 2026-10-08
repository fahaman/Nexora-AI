import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/ui-bits";
import { authStore, useAuth } from "@/lib/auth-store";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Nexora AI" }] }),
  component: Settings,
});

function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your workspace, profile and preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Profile" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" defaultValue={user?.name ?? "Owner"} />
            <Field label="Email" defaultValue={user?.email ?? ""} />
            <Field label="Role" defaultValue="Owner / Admin" disabled />
            <Field label="Time zone" defaultValue="Asia/Karachi" />
          </div>
          <button className="mt-5 h-10 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-glow">
            Save changes
          </button>
        </Panel>

        <Panel title="Workspace">
          <Field label="Workspace name" defaultValue="Nexora HQ" />
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Theme</div>
            <div className="flex gap-2">
              <button
                onClick={() => document.documentElement.classList.add("dark")}
                className="flex-1 h-10 rounded-lg border border-border bg-card text-sm"
              >
                Dark
              </button>
              <button
                onClick={() => document.documentElement.classList.remove("dark")}
                className="flex-1 h-10 rounded-lg border border-border bg-card text-sm"
              >
                Light
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              authStore.logout();
              navigate({ to: "/login" });
            }}
            className="mt-6 w-full h-10 rounded-lg border border-destructive/40 text-destructive text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </Panel>
      </div>
    </>
  );
}

function Field({
  label,
  defaultValue,
  disabled,
}: {
  label: string;
  defaultValue: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        defaultValue={defaultValue}
        disabled={disabled}
        className="mt-1 w-full h-11 rounded-lg bg-muted/60 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
      />
    </label>
  );
}
