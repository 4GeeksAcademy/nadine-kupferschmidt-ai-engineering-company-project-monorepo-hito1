import type {
  IncidentBranch,
  IncidentCategory,
  IncidentOrigin,
  IncidentStatus,
} from "./types";

export const BRANCH_OPTIONS: readonly { value: IncidentBranch; label: string }[] = [
  { value: "central", label: "Central (Medellín / Miami)" },
  { value: "medellin_centro", label: "Medellín Centro" },
  { value: "medellin_laureles", label: "Medellín Laureles" },
  { value: "medellin_envigado", label: "Medellín Envigado" },
  { value: "medellin_bello", label: "Medellín Bello" },
  { value: "medellin_itagui", label: "Medellín Itagüí" },
  { value: "bogota_chapinero", label: "Bogotá Chapinero" },
  { value: "bogota_usaquen", label: "Bogotá Usaquén" },
  { value: "cali_granada", label: "Cali Granada" },
  { value: "barranquilla_norte", label: "Barranquilla Norte" },
  { value: "miami_doral", label: "Miami Doral" },
  { value: "miami_hialeah", label: "Miami Hialeah" },
  { value: "miami_kendall", label: "Miami Kendall" },
  { value: "orlando_international", label: "Orlando International Drive" },
  { value: "fort_lauderdale", label: "Fort Lauderdale" },
];

export const CATEGORY_OPTIONS: readonly { value: IncidentCategory; label: string }[] = [
  { value: "equipment_failure", label: "Fallo de equipamiento" },
  { value: "supply_issue", label: "Problema con insumos" },
  { value: "customer_complaint", label: "Queja de cliente" },
  { value: "staff_issue", label: "Personal" },
  { value: "facility_issue", label: "Instalaciones" },
  { value: "pos_system", label: "Sistema de caja (TPV)" },
  { value: "delivery_issue", label: "Pedidos a domicilio" },
  { value: "other", label: "Otra" },
];

export const STATUS_OPTIONS: readonly { value: IncidentStatus; label: string }[] = [
  { value: "open", label: "Abierta" },
  { value: "in_progress", label: "En curso" },
  { value: "resolved", label: "Resuelta" },
  { value: "discarded", label: "Descartada" },
];

export const ALLOWED_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  open: ["in_progress", "discarded"],
  in_progress: ["resolved", "discarded"],
  resolved: [],
  discarded: [],
};

export const ORIGIN_OPTIONS: readonly { value: IncidentOrigin; label: string }[] = [
  { value: "customer", label: "Cliente" },
  { value: "branch", label: "Local" },
  { value: "internal", label: "Interno" },
];
