import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MonoLabel, Tag } from "@/components/krear/primitives";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import type { CareerEntry, JobDescription } from "@/lib/types";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job detail — Krear" },
      {
        name: "description",
        content: "Parsed requirements, match score and the career entries most relevant to this posting.",
      },
      { property: "og:title", content: "Job detail — Krear" },
      {
        property: "og:description",
        content: "Parsed requirements, match score and relevant career entries for this posting.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <JobDetail />
    </RequireAuth>
  ),
});

function JobDetail() {
  const { jobId } = Route.useParams();

  const job = useQuery({
    queryKey: ["job-description", jobId],
    queryFn: () => api.get<JobDescription>(`/api/job-descriptions/${jobId}/`),
  });

  const relevant = useQuery({
    queryKey: ["job-relevant", jobId],
    queryFn: () => api.get<CareerEntry[]>(`/api/job-descriptions/${jobId}/relevant_entries/`),
    retry: false,
  });

  const match = useQuery({
    queryKey: ["job-match", jobId],
    queryFn: () => api.get<Record<string, unknown>>(`/api/job-descriptions/${jobId}/match_score/`),
    retry: false,
  });

  const score = Number((match.data as { score?: number } | undefined)?.score ?? NaN);

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Job description"
        title={job.data?.role_title || "Untitled role"}
        description={job.data?.company ? `at ${job.data.company}` : undefined}
        actions={
          <Link to="/jobs" className="pill-outline px-6 py-3 text-sm">
            All postings
          </Link>
        }
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="paper-card p-8">
          <MonoLabel>Raw posting</MonoLabel>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">
            {job.isLoading ? "Loading…" : job.data?.raw_text}
          </p>
        </section>

        <div className="flex flex-col gap-4">
          <section className="ink-card p-8">
            <MonoLabel className="text-primary-foreground/60">Match score</MonoLabel>
            <p className="mt-4 font-mono text-6xl tracking-tighter">
              {Number.isFinite(score) ? Math.round(score) : "—"}
            </p>
            <p className="mt-2 text-sm text-primary-foreground/70">
              {match.isError
                ? "Score not available from the API yet."
                : "Similarity between this posting and your career graph."}
            </p>
          </section>

          <section className="paper-card p-8">
            <MonoLabel>Parsed requirements</MonoLabel>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(job.data?.parsed_requirements ?? {}).flatMap(([k, v]) =>
                Array.isArray(v)
                  ? v.map((item) => <Tag key={`${k}-${String(item)}`}>{String(item)}</Tag>)
                  : [<Tag key={k}>{`${k}: ${String(v)}`}</Tag>],
              )}
              {!job.data?.parsed_requirements && (
                <p className="text-sm text-muted-foreground">Not parsed yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-4 paper-card p-8">
        <MonoLabel>Most relevant career entries</MonoLabel>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(relevant.data ?? []).map((entry) => (
            <article key={entry.id} className="rounded-3xl border border-border p-5">
              <h3 className="font-mono text-base">{entry.title}</h3>
              <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{entry.description}</p>
            </article>
          ))}
          {(relevant.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              {relevant.isError ? "Retrieval endpoint unavailable." : "No matches returned."}
            </p>
          )}
        </div>
      </section>
    </WorkspacePage>
  );
}
