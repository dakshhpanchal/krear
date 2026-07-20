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