export interface CareerEntry {
  id: number;
  category: string;
  title: string;
  description: string;
  tech_stack: string[];
  metrics: string[];
  tags: string[];
  duration_start: string | null;
  duration_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: string;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: number;
  raw_text: string;
  company: string;
  role_title: string;
  parsed_requirements: {
    required_skills?: string[];
    preferred_skills?: string[];
    seniority?: string;
    role_type?: string;
  } | null;
  created_at: string;
}

export interface MatchScore {
  overall_score: number;
  matched_required: Record<string, string>;
  missing_required: string[];
  matched_preferred: Record<string, string>;
  missing_preferred: string[];
}

export interface Resume {
  id: number;
  title: string;
  job_description: number | null;
}

export interface ResumeVersion {
  id: number;
  version_number: number;
  content: {
    projects?: { title: string; year: string; bullets: string[] }[];
    experience?: { title: string; year: string; bullets: string[] }[];
  };
  pdf_file: string | null;
  diff_from_previous: { compile_error?: string } | null;
  created_at: string;
}