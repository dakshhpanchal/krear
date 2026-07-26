import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/career", label: "Career" },
  { to: "/jobs", label: "Jobs" },
  { to: "/resumes", label: "Resumes" },
  { to: "/applications", label: "Applications" },
  { to: "/cover-letters", label: "Letters" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="font-mono text-sm leading-tight tracking-tight">
          Krear
          <span className="block text-muted-foreground">Career OS</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "font-mono text-sm transition-opacity hover:opacity-60",
                pathname === l.to && "underline underline-offset-8",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="pill-outline hidden px-5 py-2 text-sm sm:inline-flex"
            >
              Sign out
            </button>
          ) : (
            <Link to="/login" className="pill-outline hidden px-5 py-2 text-sm sm:inline-flex">
              Sign in
            </Link>
          )}
          <button
            className="inline-flex size-10 items-center justify-center rounded-full border border-border lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-mono text-base"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display-lg text-[clamp(2rem,5vw,3.4rem)]">Krear</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            An AI career workspace — tailor resumes to job descriptions, score them against ATS
            filters, and track every application to offer.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/career" className="pill-outline px-5 py-2 text-sm">
            Career
          </Link>
          <Link to="/resumes" className="pill-outline px-5 py-2 text-sm">
            Resumes
          </Link>
          <Link to="/applications" className="pill-outline px-5 py-2 text-sm">
            Applications
          </Link>
        </div>
      </div>
    </footer>
  );
}
