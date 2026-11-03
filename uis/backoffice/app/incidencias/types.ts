export type Category =
  | "CUSTOMER_COMPLAINT"
  | "EQUIPMENT"
  | "SUPPLY"
  | "FOOD_QUALITY"
  | "STAFF";

export type IncidentStatus = "OPEN" | "CLOSED" | "DISCARDED";
export type SatisfactionScore = "1" | "2" | "3" | "4" | "5";

export interface IncidentMetrics {
  total: number;
  valid: number;
  invalid: number;
  invalid_counts: Record<string, number>;
  category_counts: Record<Category, number>;
  category_percentages: Record<Category, number>;
  status_counts: Record<IncidentStatus, number>;
  status_percentages: Record<IncidentStatus, number>;
  closed_cases: number;
  scored_cases: number;
  average_score: number;
  score_counts: Record<SatisfactionScore, number>;
}

export interface AnalysisResponse {
  metrics: IncidentMetrics;
  invalid_rules: { code: string; label: string }[];
}

export interface ApiError {
  detail?: string | { msg: string }[];
}