import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DragBoard } from "@/components/krear/drag-board";
import { MonoLabel } from "@/components/krear/primitives";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import { useApplications, useCreate, useJobDescriptions, useRemove, useUpdate } from "@/lib/queries";
import { APPLICATION_STATUSES } from "@/lib/types";
import type { Application, ApplicationStatus } from "@/lib/types";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Application pipeline | Krear" },
      {
        name: "description",
        content:
          "A drag-and-drop kanban board tracking every application from wishlist through assessment, interview and offer.",
      },
      { property: "og:title", content: "Application pipeline | Krear" },
      {
        property: "og:description",
        content: "Drag applications between stages; the API updates instantly.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ApplicationsPage />
    </RequireAuth>
  ),
});

const EMPTY = {
  company: "",
  role: "",
  status: "wishlist" as ApplicationStatus,
  deadline: "",
  recruiter_contact: "",
  notes: "",
  job_description: "",
};

function ApplicationsPage() {
  const { data: applications = [], isLoading, error } = useApplications();
  const { data: jobs = [] } = useJobDescriptions();
  const update = useUpdate<Application>("/api/applications/", "applications");
  const create = useCreate<Application>("/api/applications/", "applications");
  const remove = useRemove("/api/applications/", "applications");
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const items = applications.map((a) => ({ ...a, column: a.status }));

  function move(id: number, column: string) {
    update.mutate(
      { id, status: column as ApplicationStatus },
      {
        onSuccess: () => toast.success(`Moved to ${column}`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
      },
    );
  }

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Pipeline"
        title="Applications"
        description="Drag a card between stages to update its status on the server."
        actions={
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground"
          >
            {open ? "Close" : "Track application"}
          </button>
        }
      />

      {open && (
        <form
          className="paper-card mt-8 grid gap-4 p-8 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              {
                company: form.company,
                role: form.role,
                status: form.status,
                deadline: form.deadline || null,
                recruiter_contact: form.recruiter_contact,
                notes: form.notes,
                job_description: form.job_description ? Number(form.job_description) : null,
              },
              {
                onSuccess: () => {
                  toast.success("Application tracked");
                  setForm(EMPTY);
                  setOpen(false);
                },
                onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
              },
            );
          }}
        >
          <label className="flex flex-col gap-2">
            <MonoLabel>Company</MonoLabel>
            <input
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-2">
            <MonoLabel>Role</MonoLabel>
            <input
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-2">
            <MonoLabel>Stage</MonoLabel>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <MonoLabel>Deadline</MonoLabel>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-2">
            <MonoLabel>Recruiter contact</MonoLabel>
            <input
              value={form.recruiter_contact}
              onChange={(e) => setForm({ ...form, recruiter_contact: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-2">
            <MonoLabel>Job description</MonoLabel>
            <select
              value={form.job_description}
              onChange={(e) => setForm({ ...form, job_description: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            >
              <option value="">None</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.role_title || "Untitled"} @ {j.company || "Unknown"}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 md:col-span-2">
            <MonoLabel>Notes</MonoLabel>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
            />
          </label>
          <div className="md:col-span-2">
            <button
              disabled={create.isPending}
              className="rounded-full bg-primary px-7 py-3 font-serif italic text-primary-foreground disabled:opacity-50"
            >
              {create.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load applications."}
        </p>
      )}

      <div className="mt-10">
        {isLoading ? (
          <div className="h-72 animate-pulse rounded-3xl bg-muted" />
        ) : (
          <DragBoard
            columns={APPLICATION_STATUSES.map((s) => ({ id: s.id, label: s.label }))}
            items={items}
            emptyHint="Drop an application here"
            onMove={move}
            renderCard={(app) => (
              <div className="pr-5">
                <h3 className="font-mono text-sm">{app.role}</h3>
                <p className="text-xs text-muted-foreground">{app.company}</p>
                {app.deadline && (
                  <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
                    due {app.deadline}
                  </p>
                )}
                {app.notes && <p className="mt-2 line-clamp-2 text-xs">{app.notes}</p>}
                <button
                  onClick={() => remove.mutate(app.id)}
                  className="mt-3 font-mono text-[0.65rem] text-muted-foreground hover:text-destructive"
                >
                  delete
                </button>
              </div>
            )}
          />
        )}
      </div>
    </WorkspacePage>
  );
}
