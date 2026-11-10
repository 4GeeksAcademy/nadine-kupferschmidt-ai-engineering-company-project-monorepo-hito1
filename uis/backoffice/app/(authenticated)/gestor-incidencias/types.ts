export type IncidentCategory =
  | "equipment_failure"
  | "supply_issue"
  | "customer_complaint"
  | "staff_issue"
  | "facility_issue"
  | "pos_system"
  | "delivery_issue"
  | "other";

export type IncidentStatus = "open" | "in_progress" | "resolved" | "discarded";

export type IncidentOrigin = "customer" | "branch" | "internal";

export type IncidentBranch =
  | "central"
  | "medellin_centro"
  | "medellin_laureles"
  | "medellin_envigado"
  | "medellin_bello"
  | "medellin_itagui"
  | "bogota_chapinero"
  | "bogota_usaquen"
  | "cali_granada"
  | "barranquilla_norte"
  | "miami_doral"
  | "miami_hialeah"
  | "miami_kendall"
  | "orlando_international"
  | "fort_lauderdale";

export interface Incident {
  id: number;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  origin: IncidentOrigin;
  branch: IncidentBranch;
  created_at: string;
  updated_at: string;
}

export interface IncidentCreate {
  title: string;
  description: string;
  category: IncidentCategory;
  origin: IncidentOrigin;
  branch: IncidentBranch;
  status: IncidentStatus;
}

export interface IncidentFieldError {
  field: string;
  message: string;
}

// Forma del 400 que devuelve la API para validaciones.
export interface IncidentApiError extends IncidentFieldError {
  errors: IncidentFieldError[];
}
