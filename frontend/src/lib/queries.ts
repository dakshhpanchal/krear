import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getList } from "@/lib/api";
import type {
  ActivityLog,
  Application,
  CareerEntry,
  CoverLetter,
  JobDescription,
  Profile,
  Resume,
  ResumeVersion,
  Skill,
} from "@/lib/types";

const enabledInBrowser = typeof window !== "undefined";

export function useCareerEntries() {
  return useQuery({
    queryKey: ["career-entries"],
    queryFn: () => getList<CareerEntry>("/api/career-entries/"),
    enabled: enabledInBrowser,
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: () => getList<Skill>("/api/skills/"),
    enabled: enabledInBrowser,
  });
}

export function useJobDescriptions() {
  return useQuery({
    queryKey: ["job-descriptions"],
    queryFn: () => getList<JobDescription>("/api/job-descriptions/"),
    enabled: enabledInBrowser,
  });
}

export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: () => getList<Resume>("/api/resumes/"),
    enabled: enabledInBrowser,
  });
}

export function useResumeVersions(resumeId?: number) {
  return useQuery({
    queryKey: ["resume-versions", resumeId ?? "all"],
    queryFn: () => getList<ResumeVersion>("/api/resume-versions/"),
    enabled: enabledInBrowser,
    select: (rows) => (resumeId ? rows.filter((r) => r.resume === resumeId) : rows),
  });
}

export function useCoverLetters() {
  return useQuery({
    queryKey: ["cover-letters"],
    queryFn: () => getList<CoverLetter>("/api/cover-letters/"),
    enabled: enabledInBrowser,
  });
}

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: () => getList<Application>("/api/applications/"),
    enabled: enabledInBrowser,
  });
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ["activity-logs"],
    queryFn: () => getList<ActivityLog>("/api/activity-logs/"),
    enabled: enabledInBrowser,
  });
}

export function useCreate<T>(path: string, key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<T>) => api.post<T>(path, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useUpdate<T extends { id: number }>(path: string, key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<T> & { id: number }) =>
      api.patch<T>(`${path}${id}/`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useRemove(path: string, key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`${path}${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<Profile>("/api/profile/me/"),
    enabled: enabledInBrowser,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Profile>) => api.patch<Profile>("/api/profile/me/", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

