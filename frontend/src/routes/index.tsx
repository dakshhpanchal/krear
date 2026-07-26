import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  Gauge,
  GitBranch,
  KanbanSquare,
  Layers,
  Sparkles,
} from "lucide-react";
import { ArrowCircle, MonoLabel, SectionMarker, Tag } from "@/components/krear/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krear | AI resume tailoring & application tracker" },
      {
        name: "description",
        content:
          "Turn one career history into job-specific, ATS-scored resumes. Draft cover letters, version every draft, and drag applications from wishlist to offer.",
      },
      { property: "og:title", content: "Krear | AI resume tailoring & application tracker" },
      {
        property: "og:description",
        content:
          "One career graph, infinite tailored resumes. Score against the job description and track every application.",
      },
    ],
  }),
  component: Landing,
});

const CAPABILITIES = [
  {
    icon: Layers,
    title: "Career graph",
    body: "Projects, experience, education and achievements stored once, embedded for semantic retrieval.",
  },
  {
    icon: Sparkles,
    title: "Tailored generation",
    body: "Paste a job description; Krear pulls the most relevant entries and writes the resume around them.",
  },
  {
    icon: Gauge,
    title: "ATS scoring",
    body: "Every version is scored against parsed requirements with matched and missing keywords.",
  },
  {
    icon: GitBranch,
    title: "Versioned drafts",
    body: "Each regeneration is a new version with a diff from the previous one, plus a compiled PDF.",
  },
  {
    icon: FileText,
    title: "Cover letters",
    body: "Letters generated from the same job description and the exact resume version you sent.",
  },
  {
    icon: KanbanSquare,
    title: "Drag-and-drop pipeline",
    body: "Wishlist, applied, assessment, interview, offer. Drag a card, the API updates instantly.",
  },
];

function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-6 pb-10 pt-14 md:pt-20">
        <div className="rise flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <h1 className="display-xl flex-1">
            <span className="block">Resume</span>
            <span className="block text-right md:pr-4">Engine</span>
          </h1>
          <div className="flex md:justify-end pb-2">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-neutral-200 to-neutral-300 opacity-30 blur-lg transition duration-500 group-hover:opacity-50"></div>
              <img 
                src="/icon.svg" 
                className="relative size-28 md:size-36 transition-transform duration-300 hover:scale-105" 
                alt="Krear Logo" 
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr] md:items-end">
          <p className="max-w-sm text-lg leading-relaxed">
            One career history in.{" "}
            <em className="font-semibold">Job-specific, <span className="whitespace-nowrap">ATS-scored</span> resumes</em> out, versioned,
            diffed and tracked all the way to the offer.
          </p>
          <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-serif italic text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Open workspace
            </Link>
            <Link
              to="/resumes"
              className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:-translate-y-0.5"
              aria-label="Go to resumes"
            >
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          {["Django REST", "pgvector", "Celery", "LaTeX → PDF", "JWT"].map((t) => (
            <span key={t} className="pill-outline px-6 py-3 text-sm">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Product bands */}
      <section className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="ink-card flex flex-col justify-between gap-10 p-8 md:p-12">
            <MonoLabel className="text-primary-foreground/60">01 / Tailor</MonoLabel>
            <div>
              <h2 className="font-mono text-3xl md:text-5xl">Job description in, resume out.</h2>
              <p className="mt-5 max-w-xl text-primary-foreground/75">
                Krear embeds the posting, retrieves the closest career entries from your graph, and
                composes a resume that answers the requirements line by line.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-xs text-primary-foreground/70">
              {["retrieval", "match score", "bullet rewriting", "LaTeX render"].map((t) => (
                <span key={t} className="rounded-full border border-primary-foreground/25 px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="paper-card p-8">
              <h3 className="font-mono text-2xl">ATS score</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Matched vs. missing keywords, scored per version so you can see the delta before you
                submit.
              </p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[78%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">78 / 100 (sample)</p>
            </div>
            <div className="paper-card p-8">
              <h3 className="font-mono text-2xl">Pipeline</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Six stages, drag-and-drop, activity-logged.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Wishlist", "Applied", "OA", "Interview", "Offer"].map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionMarker>Capabilities</SectionMarker>

      <section className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <article key={c.title} className="paper-card group flex flex-col gap-4 p-8">
              <c.icon className="size-6" strokeWidth={1.5} />
              <h3 className="font-mono text-xl">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <SectionMarker>Workspace</SectionMarker>

      <section className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { to: "/career", title: "Career entries", note: "Reorder with drag and drop" },
            { to: "/jobs", title: "Job descriptions", note: "Match score & relevant entries" },
            { to: "/resumes", title: "Resumes", note: "Versions, ATS, PDF" },
            { to: "/applications", title: "Applications", note: "Kanban pipeline" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="paper-card flex items-center justify-between gap-6 p-8 transition-transform hover:-translate-y-1"
            >
              <div>
                <h3 className="font-mono text-2xl md:text-3xl">{l.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{l.note}</p>
              </div>
              <ArrowCircle />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
