import type {
	Candidate,
	CandidateStage,
	CandidateStatus,
	CandidatesResponse,
} from "@/types/candidate";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCandidates(
	filters: {
		status?: CandidateStatus;
		stage?: CandidateStage;
		search?: string;
	} = {},
): Promise<CandidatesResponse> {
	const params = new URLSearchParams();

	if (filters.status) params.set("status", filters.status);
	if (filters.stage) params.set("stage", filters.stage);
	if (filters.search) params.set("search", filters.search);
	params.set("limit", "100");

	const response = await fetch(`${API_URL}/records?${params.toString()}`);

	if (!response.ok) {
		throw new Error("No se pudieron obtener las candidaturas.");
	}

	return await response.json();
}

export async function getCandidateById(id: string): Promise<Candidate> {
	const response = await fetch(`${API_URL}/records/${encodeURIComponent(id)}`);

	if (!response.ok) {
		throw new Error("No se pudo obtener la candidatura.");
	}

	return await response.json();
}
