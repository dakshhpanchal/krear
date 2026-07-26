import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { API_BASE } from "@/lib/api";
import { MonoLabel } from "./primitives";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-border/60 pb-8">
      <MonoLabel>{eyebrow}</MonoLabel>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="display-lg">{title}</h1>
          {description && (
            <p className="mt-4 max-w-xl text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export function WorkspacePage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-12 rise">{children}</div>
  );
}

/** Client-side gate: the Django API issues JWTs, so auth state only exists in the browser. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-6 py-28">
        <MonoLabel>Restricted</MonoLabel>
        <h1 className="display-lg">Sign in required</h1>
        <p className="text-muted-foreground">
          This workspace talks to your Krear API at{" "}
          <span className="font-mono text-foreground">{API_BASE}</span>. Sign in with your Django
          account to load career entries, resumes and applications.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center rounded-full bg-primary px-7 py-3 font-serif italic text-primary-foreground"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
