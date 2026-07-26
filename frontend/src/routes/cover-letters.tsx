import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MonoLabel } from "@/components/krear/primitives";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import {
  useCoverLetters,
  useCreate,
  useJobDescriptions,
  useRemove,
  useResumeVersions,
} from "@/lib/queries";
import type { CoverLetter } from "@/lib/types";

export const Route = createFileRoute("/cover-letters")({
  head: () => ({
    meta: [
      { title: "Cover letters | Krear" },
      {
        name: "description",
        content: "Cover letters written from the same job description and resume version you sent.",
      },
      { property: "og:title", content: "Cover letters | Krear" },
      {
        property: "og:description",
        content: "Cover letters tied to the exact job description and resume version.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <CoverLettersPage />
    </RequireAuth>
  ),
});

function CoverLettersPage() {
  const { data: letters = [], isLoading, error } = useCoverLetters();
  const { data: jobs = [] } = useJobDescriptions();
  const { data: versions = [] } = useResumeVersions();
  const create = useCreate<CoverLetter>("/api/cover-letters/", "cover-letters");
  const remove = useRemove("/api/cover-letters/", "cover-letters");
  const [form, setForm] = useState({ job_description: "", resume_version: "", content: "" });

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Correspondence"
        title="Cover letters"
        description="Each letter is bound to a posting and, optionally, to the resume version it accompanied."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          {error && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load cover letters."}
            </p>
          )}
          {isLoading && <div className="h-40 animate-pulse rounded-3xl bg-muted" />}
          {letters.map((letter) => {
            const job = jobs.find((j) => j.id === letter.job_description);
            return (
              <article key={letter.id} className="paper-card p-8">
                <MonoLabel>
                  {job ? `${job.role_title || "Untitled"} @ ${job.company || "Unknown"}` : "Posting"}
                </MonoLabel>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{letter.content}</p>
                <button
                  onClick={() => remove.mutate(letter.id)}
                  className="mt-5 font-mono text-xs text-muted-foreground hover:text-destructive"
                >
                  delete
                </button>
              </article>
            );
          })}
          {!isLoading && letters.length === 0 && (
            <div className="paper-card p-10 text-center">
              <p className="font-mono">No cover letters yet.</p>
            </div>
          )}
        </div>

        <form
          className="paper-card flex h-fit flex-col gap-4 p-7"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              {
                job_description: Number(form.job_description),
                resume_version: form.resume_version ? Number(form.resume_version) : null,
                content: form.content,
              },
              {
                onSuccess: () => {
                  toast.success("Letter saved");
                  setForm({ job_description: "", resume_version: "", content: "" });
                },
                onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
              },
            );
          }}
        >
          <MonoLabel>New letter</MonoLabel>
          <select
            required
            value={form.job_description}
            onChange={(e) => setForm({ ...form, job_description: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          >
            <option value="">Select a posting</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.role_title || "Untitled"} @ {j.company || "Unknown"}
              </option>
            ))}
          </select>
          <select
            value={form.resume_version}
            onChange={(e) => setForm({ ...form, resume_version: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          >
            <option value="">No resume version</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Resume #{v.resume} · v{v.version_number}
              </option>
            ))}
          </select>
          <textarea
            required
            rows={12}
            placeholder="Letter body…"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
          />
          <button
            disabled={create.isPending}
            className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground disabled:opacity-50"
          >
            {create.isPending ? "Saving…" : "Save letter"}
          </button>
        </form>
      </div>
    </WorkspacePage>
  );
}
