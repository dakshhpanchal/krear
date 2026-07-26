import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowCircle, MonoLabel } from "@/components/krear/primitives";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import {
  useCreate,
  useJobDescriptions,
  useRemove,
  useResumeVersions,
  useResumes,
} from "@/lib/queries";
import type { Resume } from "@/lib/types";

export const Route = createFileRoute("/resumes/")({
  head: () => ({
    meta: [
      { title: "Resumes | Krear" },
      {
        name: "description",
        content: "Generate, version and score resumes tailored to a specific job description.",
      },
      { property: "og:title", content: "Resumes | Krear" },
      {
        property: "og:description",
        content: "Generate, version and score resumes tailored to a specific job description.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ResumesPage />
    </RequireAuth>
  ),
});

function ResumesPage() {
  const { data: resumes = [], isLoading, error } = useResumes();
  const { data: jobs = [] } = useJobDescriptions();
  const { data: versions = [] } = useResumeVersions();
  const create = useCreate<Resume>("/api/resumes/", "resumes");
  const remove = useRemove("/api/resumes/", "resumes");
  const [form, setForm] = useState({ title: "", job_description: "" });

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Documents"
        title="Resumes"
        description="One resume per target. Every generation adds a version with a diff and an ATS score."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          {error && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load resumes."}
            </p>
          )}
          {isLoading && <div className="h-40 animate-pulse rounded-3xl bg-muted" />}
          {resumes.map((resume) => {
            const count = versions.filter((v) => v.resume === resume.id).length;
            const job = jobs.find((j) => j.id === resume.job_description);
            return (
              <article
                key={resume.id}
                className="paper-card flex items-center justify-between gap-6 p-7"
              >
                <div className="min-w-0">
                  <h2 className="font-mono text-2xl">{resume.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job ? `${job.role_title || "Untitled"} @ ${job.company || "Unknown"}` : "No target job"}
                    {" · "}
                    {count} version{count === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() => remove.mutate(resume.id)}
                    className="mt-4 font-mono text-xs text-muted-foreground hover:text-destructive"
                  >
                    delete
                  </button>
                </div>
                <Link
                  to="/resumes/$resumeId"
                  params={{ resumeId: String(resume.id) }}
                  aria-label={`Open ${resume.title}`}
                >
                  <ArrowCircle />
                </Link>
              </article>
            );
          })}
          {!isLoading && resumes.length === 0 && (
            <div className="paper-card p-10 text-center">
              <p className="font-mono">No resumes yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create one against a saved job description.
              </p>
            </div>
          )}
        </div>

        <form
          className="paper-card flex h-fit flex-col gap-4 p-7"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              {
                title: form.title,
                job_description: form.job_description ? Number(form.job_description) : null,
              },
              {
                onSuccess: () => {
                  toast.success("Resume created");
                  setForm({ title: "", job_description: "" });
                },
                onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
              },
            );
          }}
        >
          <MonoLabel>New resume</MonoLabel>
          <input
            required
            placeholder="Title, e.g. Backend - Stripe"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          />
          <select
            value={form.job_description}
            onChange={(e) => setForm({ ...form, job_description: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          >
            <option value="">No target job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.role_title || "Untitled"} @ {j.company || "Unknown"}
              </option>
            ))}
          </select>
          <button
            disabled={create.isPending}
            className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create resume"}
          </button>
        </form>
      </div>
    </WorkspacePage>
  );
}
