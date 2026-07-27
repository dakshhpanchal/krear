import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MonoLabel } from "@/components/krear/primitives";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up | Krear" },
      { name: "description", content: "Create your Krear career workspace." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center">
      <div className="rise">
        <MonoLabel>Access</MonoLabel>
        <h1 className="display-lg mt-6">Sign up</h1>
        <p className="mt-6 max-w-md text-muted-foreground">
          Create an account on <span className="font-mono text-foreground">{API_BASE}</span>.
          Already have one?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Sign in
          </Link>
          .
        </p>
      </div>

      <div className="paper-card p-8 md:p-10">
        {isAuthenticated ? (
          <div className="flex flex-col items-start gap-5">
            <h2 className="font-mono text-2xl">Already signed in</h2>
            <button
              className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Go to dashboard
            </button>
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
              <MonoLabel>Email</MonoLabel>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-foreground"
              />
            </label>
            <label className="flex flex-col gap-2">
              <MonoLabel>Password</MonoLabel>
              <input
                required
                type="password"
                autoComplete="new-password"
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
              {busy ? "Creating account…" : "Sign up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}