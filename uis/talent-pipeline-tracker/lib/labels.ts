import type { CandidateStage, CandidateStatus } from "@/types/candidate";

export const STATUS_LABELS: Record<CandidateStatus, string> = {
	received: "Recibida",
	in_progress: "En proceso",
	selected: "Seleccionada",
	discarded: "Descartada",
};

export const STATUS_STYLES: Record<CandidateStatus, string> = {
	received: "border-blue-600 text-blue-700",
	in_progress: "border-brand-ochre text-brand-ochre",
	selected: "border-green-600 text-green-700",
	discarded: "border-red-600 text-red-700",
};

export const STAGE_LABELS: Record<CandidateStage, string> = {
	pending: "Pendiente de revisión",
	review: "En revisión",
	personal_interview: "Entrevista personal",
	technical_interview: "Entrevista técnica",
	offer_presented: "Oferta presentada",
};
