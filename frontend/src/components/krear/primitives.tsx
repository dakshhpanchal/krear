import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionMarker({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center py-14">
      <span className="section-marker">.../{children}...</span>
    </div>
  );
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("mono-label", className)}>{children}</span>;
}

export function InkButton({
  to,
  children,
  onClick,
  type = "button",
  className,
  disabled,
}: {
  to?: string;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-serif italic text-primary-foreground",
    "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-ink)] disabled:opacity-50",
    className,
  );
  if (to) {
    return (
      <Link to={to} className={base}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  );
}

export function OutlinePill({
  children,
  onClick,
  active,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pill-outline px-5 py-2 text-sm",
        active && "bg-primary text-primary-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ArrowCircle({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground",
        className,
      )}
    >
      <ArrowUpRight className="size-4" />
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border px-3 py-1 font-mono text-[0.7rem] tracking-tight">
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="paper-card flex flex-col items-center gap-3 px-8 py-16 text-center">
      <h3 className="font-mono text-lg">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
