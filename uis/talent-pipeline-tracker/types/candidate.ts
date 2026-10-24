export type CandidateStatus =
  | "received"
  | "in_progress"
  | "selected"
  | "discarded";

export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export type Note = {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
};

export type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  applied_at: string;
  updated_at: string;
  notes?: Note[];
  notes_count: number;
};

export type CandidatesResponse = {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
};

export type CandidateFormData = Pick<
  Candidate,
  | "full_name"
  | "email"
  | "phone"
  | "position"
  | "linkedin_url"
  | "cv_url"
  | "experience_years"
>;

export type NotesResponse = {
  data: Note[];
  meta: {
    total: number;
  };
};