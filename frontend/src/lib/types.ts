export type CareerCategory =
  | "project"
  | "experience"
  | "education"
  | "achievement"
  | "certification"
  | "award"
  | "leadership"
  | "publication";

export const CAREER_CATEGORIES: CareerCategory[] = [
  "project",
  "experience",
  "education",
  "achievement",
  "certification",
  "award",
  "leadership",
  "publication",
];

export interface CareerEntry {
  id: number;
  category: CareerCategory;
  title: string;
  description: string;
  tech_stack: string[];
  metrics: string[];
  tags: string[];
  duration_start: string | null;
  duration_end: string | null;
  created_at?: string;
  updated_at?: string;
}

export type Proficiency = "beginner" | "intermediate" | "advanced" | "expert";

export const PROFICIENCIES: Proficiency[] = ["beginner", "intermediate", "advanced", "expert"];

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: Proficiency;
}

export interface JobDescription {
  id: number;
  raw_text: string;
  company: string;
  role_title: string;
  parsed_requirements: Record<string, unknown> | null;
  created_at?: string;
}

export interface Resume {
  id: number;
  title: string;
  job_description: number | null;
  created_at?: string;
}

export interface ResumeSection {
  heading: string;
  bullets: string[];
}

export interface ResumeVersion {
  id: number;
  resume: number;
  version_number: number;
  content: { sections?: ResumeSection[] } & Record<string, unknown>;
  diff_from_previous: unknown;
  has_pdf: boolean;
  pdf_filename: string | null;
  created_at?: string;
}

export interface CoverLetter {
  id: number;
  job_description: number;
  resume_version: number | null;
  content: string;
  created_at?: string;
}

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "oa"
  | "interview"
  | "offer"
  | "rejected";

export const APPLICATION_STATUSES: { id: ApplicationStatus; label: string }[] = [
  { id: "wishlist", label: "Wishlist" },
  { id: "applied", label: "Applied" },
  { id: "oa", label: "Assessment" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
];

export interface Application {
  id: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  job_description: number | null;
  resume_version: number | null;
  cover_letter: number | null;
  applied_date: string | null;
  deadline: string | null;
  recruiter_contact: string;
  notes: string;
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  created_at: string;
}

export interface AtsScore {
  content_score: number;
  parseability_score: number;
  overall_score: number;
  parseability_issues: string[];
  matched_required: Record<string, string>;
  missing_required: string[];
  matched_preferred: Record<string, string>;
  missing_preferred: string[];
}