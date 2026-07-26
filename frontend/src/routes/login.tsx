import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MonoLabel } from "@/components/krear/primitives";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Krear" },
      { name: "description", content: "Sign in to your Krear career workspace." },
      { property: "og:title", content: "Sign in — Krear" },
      { property: "og:description", content: "Sign in to your Krear career workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, logout, username } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.username, form.password);
      toast.success("Signed in");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center">
      <div className="rise">
        <MonoLabel>Access</MonoLabel>
        <h1 className="display-lg mt-6">Sign in</h1>
        <p className="mt-6 max-w-md text-muted-foreground">
          Krear authenticates against your Django backend with JWT. The workspace is talking to{" "}
          <span className="font-mono text-foreground">{API_BASE}</span> — set{" "}
          <span className="font-mono text-foreground">VITE_API_URL</span> to point at a deployed
          API.
        </p>
      </div>

      <div className="paper-card p-8 md:p-10">
        {isAuthenticated ? (
          <div className="flex flex-col items-start gap-5">
            <h2 className="font-mono text-2xl">Already signed in</h2>
            <p className="text-sm text-muted-foreground">
              Session active {username ? `as ${username}` : ""}.
            </p>
            <div className="flex gap-3">
              <button
                className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground"
                onClick={() => navigate({ to: "/dashboard" })}
              >
                Go to dashboard
              </button>
              <button className="pill-outline px-6 py-3 text-sm" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <MonoLabel>Username</MonoLabel>
              <input
                required
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-2">
              <MonoLabel>Password</MonoLabel>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-foreground"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-full bg-primary px-7 py-3 font-serif italic text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
