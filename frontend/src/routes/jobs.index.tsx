import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowCircle, MonoLabel } from "@/components/krear/primitives";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import { useCreate, useJobDescriptions, useRemove } from "@/lib/queries";
import type { JobDescription } from "@/lib/types";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Job descriptions | Krear" },
      {
        name: "description",
        content:
          "Paste job postings, parse their requirements and see which career entries match best.",
      },
      { property: "og:title", content: "Job descriptions | Krear" },
      {
        property: "og:description",
        content: "Paste a posting and let Krear surface the most relevant career entries.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <JobsPage />
    </RequireAuth>
  ),
});

function JobsPage() {
  const { data: jobs = [], isLoading, error } = useJobDescriptions();
  const create = useCreate<JobDescription>("/api/job-descriptions/", "job-descriptions");
  const remove = useRemove("/api/job-descriptions/", "job-descriptions");
  const [form, setForm] = useState({ company: "", role_title: "", raw_text: "" });

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Targets"
        title="Job descriptions"
        description="Each posting is embedded so Krear can retrieve the career entries that answer it."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          {error && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load job descriptions."}
            </p>
          )}
          {isLoading && <div className="h-40 animate-pulse rounded-3xl bg-muted" />}
          {jobs.map((job) => (
            <article key={job.id} className="paper-card flex items-start justify-between gap-6 p-7">
              <div className="min-w-0">
                <h2 className="font-mono text-2xl">{job.role_title || "Untitled role"}</h2>
                <p className="text-sm text-muted-foreground">{job.company || "Unknown company"}</p>
                <p className="mt-4 line-clamp-3 text-sm">{job.raw_text}</p>
                <button
                  onClick={() => remove.mutate(job.id)}
                  className="mt-4 font-mono text-xs text-muted-foreground hover:text-destructive"
                >
                  delete
                </button>
              </div>
              <Link
                to="/jobs/$jobId"
                params={{ jobId: String(job.id) }}
                aria-label={`Open ${job.role_title}`}
              >
                <ArrowCircle />
              </Link>
            </article>
          ))}
          {!isLoading && jobs.length === 0 && (
            <div className="paper-card p-10 text-center">
              <p className="font-mono">No job descriptions yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Paste one on the right to get started.
              </p>
            </div>
          )}
        </div>

        <form
          className="paper-card flex h-fit flex-col gap-4 p-7"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(form, {
              onSuccess: () => {
                toast.success("Job description saved");
                setForm({ company: "", role_title: "", raw_text: "" });
              },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
            });
          }}
        >
          <MonoLabel>Paste a posting</MonoLabel>
          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          />
          <input
            placeholder="Role title"
            value={form.role_title}
            onChange={(e) => setForm({ ...form, role_title: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          />
          <textarea
            required
            rows={12}
            placeholder="Full job description text…"
            value={form.raw_text}
            onChange={(e) => setForm({ ...form, raw_text: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
          />
          <button
            disabled={create.isPending}
            className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground disabled:opacity-50"
          >
            {create.isPending ? "Saving…" : "Save posting"}
          </button>
        </form>
      </div>
    </WorkspacePage>
  );
}
