import type {
	Candidate,
	CandidateFormData,
	CandidateStage,
	CandidateStatus,
	CandidatesResponse,
	Note,
	NotesResponse,
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
	params.set("limit", "250");

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

export async function createCandidate(
	data: CandidateFormData,
): Promise<Candidate> {
	const response = await fetch(`${API_URL}/records`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("No se pudo crear la candidatura.");
	}

	return await response.json();
}

export async function updateCandidate(
	id: string,
	data: CandidateFormData,
): Promise<Candidate> {
	const response = await fetch(
		`${API_URL}/records/${encodeURIComponent(id)}`,
		{
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("No se pudo actualizar la candidatura.");
	}

	return await response.json();
}

export async function patchCandidate(
	id: string,
	data: { status?: CandidateStatus; stage?: CandidateStage },
): Promise<Candidate> {
	const response = await fetch(
		`${API_URL}/records/${encodeURIComponent(id)}`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("No se pudo actualizar el estado o la etapa de la candidatura.");
	}

	return await response.json();
}

export async function getNotes(id: string): Promise<Note[]> {
	const response = await fetch(
		`${API_URL}/records/${encodeURIComponent(id)}/notes`,
	);

	if (!response.ok) {
		throw new Error("No se pudieron obtener las notas.");
	}

	const notesResponse: NotesResponse = await response.json();
	return notesResponse.data;
}

export async function addNote(id: string, content: string): Promise<void> {
	const response = await fetch(
		`${API_URL}/records/${encodeURIComponent(id)}/notes`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		},
	);

	if (!response.ok) {
		throw new Error("No se pudo agregar la nota.");
	}
}

export async function deleteNote(id: string, noteId: string): Promise<void> {
	const response = await fetch(
		`${API_URL}/records/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`,
		{ method: "DELETE" },
	);

	if (!response.ok) {
		throw new Error("No se pudo eliminar la nota.");
	}
}
