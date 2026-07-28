import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { DragBoard } from "@/components/krear/drag-board";
import { MonoLabel, Tag } from "@/components/krear/primitives";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import { useCareerEntries, useCreate, useRemove, useSkills, useUpdate } from "@/lib/queries";
import { CAREER_CATEGORIES, PROFICIENCIES } from "@/lib/types";
import type { CareerEntry, Skill } from "@/lib/types";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Career graph | Krear" },
      {
        name: "description",
        content:
          "Your projects, experience, education and achievements, drag entries between categories and manage skills.",
      },
      { property: "og:title", content: "Career graph | Krear" },
      {
        property: "og:description",
        content: "Drag career entries between categories and keep your skill matrix current.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <CareerPage />
    </RequireAuth>
  ),
});

const EMPTY = {
  title: "",
  category: "project" as CareerEntry["category"],
  description: "",
  tech_stack: "",
  tags: "",
  metrics: "",
  duration_start: "",
  duration_end: "",
};

function CareerPage() {
  const { data: entries = [], isLoading, error } = useCareerEntries();
  const update = useUpdate<CareerEntry>("/api/career-entries/", "career-entries");
  const remove = useRemove("/api/career-entries/", "career-entries");
  const create = useCreate<CareerEntry>("/api/career-entries/", "career-entries");
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const boardItems = entries.map((e) => ({ ...e, column: e.category }));

  function move(id: number, column: string) {
    update.mutate(
      { id, category: column as CareerEntry["category"] },
      {
        onSuccess: () => toast.success(`Moved to ${column}`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Move failed"),
      },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const split = (v: string) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    create.mutate(
      {
        title: form.title,
        category: form.category,
        description: form.description,
        tech_stack: split(form.tech_stack),
        tags: split(form.tags),
        metrics: split(form.metrics),
        duration_start: form.duration_start || null,
        duration_end: form.duration_end || null,
      },
      {
        onSuccess: () => {
          toast.success("Entry added");
          setForm(EMPTY);
          setShowForm(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Create failed"),
      },
    );
  }

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Source of truth"
        title="Career graph"
        description="Every entry is embedded and retrieved when tailoring a resume. Drag a card to re-categorise it."
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground"
          >
            {showForm ? "Close" : "New entry"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={submit} className="paper-card mt-8 grid gap-4 p-8 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <MonoLabel>Title</MonoLabel>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-2">
            <MonoLabel>Category</MonoLabel>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as CareerEntry["category"] })
              }
              className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
            >
              {CAREER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 md:col-span-2">
            <MonoLabel>Description</MonoLabel>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
            />
          </label>
          {(
            [
              ["tech_stack", "Tech stack (comma separated)"],
              ["tags", "Tags (comma separated)"],
              ["metrics", "Metrics (comma separated)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-2">
              <MonoLabel>{label}</MonoLabel>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
              />
            </label>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <MonoLabel>Start</MonoLabel>
              <input
                type="date"
                value={form.duration_start}
                onChange={(e) => setForm({ ...form, duration_start: e.target.value })}
                className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
              />
            </label>
            <label className="flex flex-col gap-2">
              <MonoLabel>End</MonoLabel>
              <input
                type="date"
                value={form.duration_end}
                onChange={(e) => setForm({ ...form, duration_end: e.target.value })}
                className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
              />
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-full bg-primary px-7 py-3 font-serif italic text-primary-foreground disabled:opacity-50"
            >
              {create.isPending ? "Saving…" : "Save entry"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load career entries."}
        </p>
      )}

      <div className="mt-10">
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        ) : (
          <DragBoard
            columns={CAREER_CATEGORIES.map((c) => ({ id: c, label: c }))}
            items={boardItems}
            emptyHint="Drag an entry here"
            onMove={move}
            renderCard={(entry) => (
              <div className="pr-5">
                <h3 className="font-mono text-sm leading-snug">{entry.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                  {entry.description}
                </p>
                {entry.tech_stack?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {entry.tech_stack.slice(0, 4).map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => remove.mutate(entry.id)}
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[0.65rem] text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" /> delete
                </button>
              </div>
            )}
          />
        )}
      </div>

      <SkillsPanel />
    </WorkspacePage>
  );
}

function SkillsPanel() {
  const { data: skills = [] } = useSkills();
  const create = useCreate<Skill>("/api/skills/", "skills");
  const remove = useRemove("/api/skills/", "skills");
  const [draft, setDraft] = useState({
    name: "",
    category: "",
    proficiency: "intermediate" as Skill["proficiency"],
  });

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const key = s.category || "General";
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  return (
    <section className="mt-16">
      <div className="grain-divider" />
      <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="paper-card p-8">
          <MonoLabel>Skill matrix</MonoLabel>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat}>
                <h3 className="font-mono text-lg">{cat}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {list.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => remove.mutate(s.id)}
                      title="Click to remove"
                      className="rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-destructive hover:text-destructive"
                    >
                      {s.name} · {s.proficiency.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills recorded yet.</p>
            )}
          </div>
        </div>

        <form
          className="paper-card flex flex-col gap-4 p-8"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(draft, {
              onSuccess: () => {
                toast.success("Skill added");
                setDraft({ name: "", category: "", proficiency: "intermediate" });
              },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
            });
          }}
        >
          <MonoLabel>Add skill</MonoLabel>
          <input
            required
            placeholder="Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          />
          <input
            placeholder="Category"
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          />
          <select
            value={draft.proficiency}
            onChange={(e) =>
              setDraft({ ...draft, proficiency: e.target.value as Skill["proficiency"] })
            }
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm"
          >
            {PROFICIENCIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button className="rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground">
            Add
          </button>
        </form>
      </div>
    </section>
  );
}
