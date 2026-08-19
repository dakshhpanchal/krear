import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Sparkles } from "lucide-react";
import { API_BASE, api, tokenStore } from "@/lib/api";
import { MonoLabel, Tag } from "@/components/krear/primitives";
import { SortableList } from "@/components/krear/sortable-list";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import { useResumeVersions } from "@/lib/queries";
import type { AtsScore, Resume, ResumeSection, ResumeVersion } from "@/lib/types";

export const Route = createFileRoute("/resumes/$resumeId")({
  head: () => ({
    meta: [
      { title: "Resume versions | Krear" },
      {
        name: "description",
        content:
          "Compare resume versions, reorder bullets with drag and drop, check the ATS score and download the PDF.",
      },
      { property: "og:title", content: "Resume versions | Krear" },
      {
        property: "og:description",
        content: "Reorder bullets by dragging, inspect ATS scores and download the compiled PDF.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ResumeDetail />
    </RequireAuth>
  ),
});

function ResumeDetail() {
  const { resumeId } = Route.useParams();
  const qc = useQueryClient();
  const id = Number(resumeId);

  const resume = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: () => api.get<Resume>(`/api/resumes/${resumeId}/`),
  });

  const { data: versions = [], isLoading } = useResumeVersions(id);
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = versions.find((v) => v.id === activeId) ?? versions[0];
  const [downloading, setDownloading] = useState(false);

  const [expectedVersionCount, setExpectedVersionCount] = useState(0);

  const isGenerating = Boolean(
    resume.data?.generation_status &&
      !["idle", "failed"].includes(resume.data.generation_status)
  );
  const progress = resume.data?.generation_progress ?? 0;
  const statusText = resume.data?.generation_status ?? "";

  useEffect(() => {
    if (!activeId && versions.length) setActiveId(versions[0].id);
  }, [versions, activeId]);

  const generate = useMutation({
    mutationFn: () => api.post(`/api/resumes/${resumeId}/generate/`),
    onSuccess: () => {
      toast.success("Generation requested");
      setExpectedVersionCount(versions.length + 1);
      qc.invalidateQueries({ queryKey: ["resume", resumeId] });
      qc.invalidateQueries({ queryKey: ["resume-versions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  useEffect(() => {
    if (!isGenerating) return;

    const pollInterval = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["resume", resumeId] });
      qc.invalidateQueries({ queryKey: ["resume-versions"] });
    }, 1500);

    return () => {
      clearInterval(pollInterval);
    };
  }, [isGenerating, qc, resumeId]);

  useEffect(() => {
    if (!isGenerating && expectedVersionCount > 0) {
      const newVersion = versions.find((v) => v.version_number === expectedVersionCount);
      if (newVersion) {
        if (newVersion.has_pdf) {
          setActiveId(newVersion.id);
          toast.success(`Version ${expectedVersionCount} generated successfully!`);
          setExpectedVersionCount(0);
        } else if (
          newVersion.diff_from_previous &&
          typeof newVersion.diff_from_previous === "object" &&
          "compile_error" in newVersion.diff_from_previous
        ) {
          toast.error(`Compilation failed: ${(newVersion.diff_from_previous as any).compile_error}`);
          setExpectedVersionCount(0);
        }
      }
    }
  }, [isGenerating, expectedVersionCount, versions]);



  const saveSections = useMutation({
    mutationFn: ({ version, sections }: { version: ResumeVersion; sections: ResumeSection[] }) =>
      api.patch<ResumeVersion>(`/api/resume-versions/${version.id}/`, {
        content: { ...version.content, sections },
      }),
    onSuccess: () => {
      toast.success("Order saved");
      qc.invalidateQueries({ queryKey: ["resume-versions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const ats = useQuery({
    queryKey: ["ats", active?.id],
    queryFn: () => api.get<AtsScore>(`/api/resume-versions/${active!.id}/ats_score/`),
    enabled: Boolean(active?.id),
    retry: false,
  });

  const sections: ResumeSection[] = Array.isArray(active?.content?.sections)
    ? (active!.content.sections as ResumeSection[])
    : [];

  function reorderBullets(sectionIndex: number, bullets: string[]) {
    if (!active) return;
    const next = sections.map((s, i) => (i === sectionIndex ? { ...s, bullets } : s));
    saveSections.mutate({ version: active, sections: next });
  }

  function reorderSections(next: ResumeSection[]) {
    if (!active) return;
    saveSections.mutate({ version: active, sections: next });
  }

  // The download endpoint requires the JWT Authorization header, which a plain
  // <a href> won't attach (token lives in localStorage, not a cookie). Fetch
  // the PDF as a blob with auth, then trigger a client-side download instead.
  async function downloadPdf() {
    if (!active) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/api/resume-versions/${active.id}/download/`, {
        headers: { Authorization: `Bearer ${tokenStore.access}` },
      });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_v${active.version_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  const score = Number(ats.data?.overall_score ?? NaN);
  const matchedKeywords = Object.values(ats.data?.matched_required ?? {}).concat(
    Object.values(ats.data?.matched_preferred ?? {}),
  );
  const missingKeywords = (ats.data?.missing_required ?? []).concat(ats.data?.missing_preferred ?? []);

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Resume"
        title={resume.data?.title ?? "Loading…"}
        description="Drag section headings or individual bullets to reorder; changes save straight to the version."
        actions={
          <>
            <Link to="/resumes" className="pill-outline px-6 py-3 text-sm">
              All resumes
            </Link>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending || isGenerating}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-serif italic text-primary-foreground disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {generate.isPending || isGenerating ? "Generating…" : "Generate version"}
            </button>
          </>
        }
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <aside className="paper-card h-fit p-6">
          <MonoLabel>Versions</MonoLabel>
          <div className="mt-4 flex flex-col gap-2">
            {isLoading && <div className="h-16 animate-pulse rounded-2xl bg-muted" />}
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveId(v.id)}
                className={`rounded-2xl border px-4 py-3 text-left font-mono text-sm transition-colors ${
                  active?.id === v.id
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent"
                }`}
              >
                v{v.version_number}
                <span className="block text-[0.65rem] opacity-70">
                  {v.created_at ? new Date(v.created_at).toLocaleDateString() : ""}
                </span>
              </button>
            ))}
            {!isLoading && versions.length === 0 && (
              <p className="text-sm text-muted-foreground">No versions yet.</p>
            )}
          </div>
        </aside>

        <section className="paper-card p-8">
          <MonoLabel>Content</MonoLabel>
          {isGenerating && (
            <div className="mb-6 mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-primary animate-pulse uppercase">
                  {statusText || "Starting Generation..."}
                </span>
                <span className="font-mono text-xs font-semibold text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {!active && !isGenerating && (
            <p className="mt-6 text-sm text-muted-foreground">Generate a version to edit content.</p>
          )}
          {active && sections.length === 0 && (
            <pre className="mt-6 overflow-x-auto rounded-2xl bg-muted p-4 font-mono text-xs">
              {JSON.stringify(active.content, null, 2)}
            </pre>
          )}
          {active && sections.length > 0 && (
            <div className="mt-6 flex flex-col gap-8">
              <SortableList
                items={sections}
                getId={(s) => `section-${s.heading}`}
                onReorder={reorderSections}
                renderItem={(section, i) => (
                  <div>
                    <h3 className="font-mono text-lg">{section.heading}</h3>
                    <div className="mt-3">
                      <SortableList
                        items={section.bullets.map((b, bi) => ({ b, bi }))}
                        getId={(x) => `b-${i}-${x.bi}`}
                        onReorder={(next) =>
                          reorderBullets(
                            i,
                            next.map((x) => x.b),
                          )
                        }
                        renderItem={(x) => <p className="text-sm leading-relaxed">{x.b}</p>}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className="ink-card p-7">
            <MonoLabel className="text-primary-foreground/60">ATS score</MonoLabel>
            <p className="mt-3 font-mono text-6xl tracking-tighter">
              {Number.isFinite(score) ? Math.round(score) : "-"}
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20">
              <div
                className="h-full rounded-full bg-primary-foreground transition-[width] duration-500"
                style={{ width: `${Number.isFinite(score) ? Math.min(score, 100) : 0}%` }}
              />
            </div>
          </section>

          <section className="paper-card p-7">
            <MonoLabel>Keywords</MonoLabel>
            <p className="mt-4 font-mono text-xs text-muted-foreground">matched</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {matchedKeywords.map((k) => (
                <Tag key={k}>{k}</Tag>
              ))}
            </div>
            <p className="mt-5 font-mono text-xs text-muted-foreground">missing</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {missingKeywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-destructive/40 px-3 py-1 font-mono text-[0.7rem] text-destructive"
                >
                  {k}
                </span>
              ))}
            </div>
            {ats.isError && (
              <p className="mt-4 text-sm text-muted-foreground">Scoring endpoint unavailable.</p>
            )}
          </section>

          {active?.has_pdf && (
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="paper-card inline-flex items-center justify-center gap-2 p-5 font-mono text-sm hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Download className="size-4" /> {downloading ? "Downloading…" : "Download PDF"}
            </button>
          )}
        </div>
      </div>
    </WorkspacePage>
  );
}