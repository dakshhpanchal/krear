import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import { MonoLabel, Tag } from "@/components/krear/primitives";
import {
  useActivityLogs,
  useApplications,
  useCareerEntries,
  useCoverLetters,
  useJobDescriptions,
  useResumes,
} from "@/lib/queries";
import { APPLICATION_STATUSES } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Krear" },
      {
        name: "description",
        content: "Pipeline health, resume versions and recent activity across your job search.",
      },
      { property: "og:title", content: "Dashboard | Krear" },
      {
        property: "og:description",
        content: "Pipeline health, resume versions and recent activity across your job search.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

function Stat({ label, value, to }: { label: string; value: number | string; to: string }) {
  return (
    <Link to={to} className="paper-card flex flex-col gap-6 p-6 transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <MonoLabel>{label}</MonoLabel>
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </div>
      <span className="font-mono text-5xl tracking-tighter">{value}</span>
    </Link>
  );
}

function Dashboard() {
  const entries = useCareerEntries();
  const jobs = useJobDescriptions();
  const resumes = useResumes();
  const apps = useApplications();
  const letters = useCoverLetters();
  const logs = useActivityLogs();

  const applications = apps.data ?? [];
  const loading = entries.isLoading || apps.isLoading;
  const error = entries.error ?? apps.error;

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Everything the Krear API knows about your search, in one board."
      />

      {error && (
        <p className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not reach the API."}
        </p>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Career entries" value={loading ? "-" : (entries.data?.length ?? 0)} to="/career" />
        <Stat label="Job descriptions" value={jobs.data?.length ?? 0} to="/jobs" />
        <Stat label="Resumes" value={resumes.data?.length ?? 0} to="/resumes" />
        <Stat label="Applications" value={applications.length} to="/applications" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="paper-card p-8">
          <MonoLabel>Pipeline</MonoLabel>
          <div className="mt-6 flex flex-col gap-4">
            {APPLICATION_STATUSES.map((s) => {
              const count = applications.filter((a) => a.status === s.id).length;
              const pct = applications.length ? (count / applications.length) * 100 : 0;
              return (
                <div key={s.id}>
                  <div className="flex items-baseline justify-between font-mono text-sm">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/applications" className="pill-outline mt-8 inline-flex px-6 py-2 text-sm">
            Open pipeline
          </Link>
        </section>

        <section className="paper-card p-8">
          <MonoLabel>Recent activity</MonoLabel>
          <ul className="mt-6 flex flex-col gap-4">
            {(logs.data ?? []).slice(0, 8).map((log) => (
              <li key={log.id} className="border-b border-border/60 pb-3 last:border-0">
                <p className="font-mono text-sm">{log.action}</p>
                <p className="text-xs text-muted-foreground">
                  {log.entity_type} #{log.entity_id} ·{" "}
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </li>
            ))}
            {(logs.data ?? []).length === 0 && (
              <li className="text-sm text-muted-foreground">No activity logged yet.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="mt-4 paper-card p-8">
        <MonoLabel>Cover letters</MonoLabel>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="font-mono text-4xl">{letters.data?.length ?? 0}</span>
          <Tag>generated</Tag>
          <Link to="/cover-letters" className="pill-outline px-5 py-2 text-sm">
            Review letters
          </Link>
        </div>
      </section>
    </WorkspacePage>
  );
}
