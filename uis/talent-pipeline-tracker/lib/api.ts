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

const NETWORK_ERROR_MESSAGE =
	"No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
const INVALID_RESPONSE_MESSAGE =
	"El servidor devolvió una respuesta no válida. Intenta de nuevo.";
const UNKNOWN_ERROR_MESSAGE = "Ocurrió un error inesperado. Intenta de nuevo.";

function getApiUrl(): string {
	if (!API_URL) {
		throw new Error(
			"Falta la variable NEXT_PUBLIC_API_URL. Configúrala antes de iniciar la aplicación.",
		);
	}
	return API_URL;
}

async function sendRequest(url: string, init?: RequestInit): Promise<Response> {
	try {
		return await fetch(url, init);
	} catch (error) {
		throw new Error(
			error instanceof TypeError ? NETWORK_ERROR_MESSAGE : UNKNOWN_ERROR_MESSAGE,
		);
	}
}

async function readJson<T>(response: Response): Promise<T> {
	try {
		return (await response.json()) as T;
	} catch {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}
}

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

	const response = await sendRequest(`${getApiUrl()}/records?${params.toString()}`);

	if (!response.ok) {
		throw new Error("No se pudieron obtener las candidaturas.");
	}

	return readJson<CandidatesResponse>(response);
}

export async function getCandidateById(id: string): Promise<Candidate> {
	const response = await sendRequest(`${getApiUrl()}/records/${encodeURIComponent(id)}`);

	if (!response.ok) {
		throw new Error("No se pudo obtener la candidatura.");
	}

	return readJson<Candidate>(response);
}

export async function createCandidate(
	data: CandidateFormData,
): Promise<Candidate> {
	const response = await sendRequest(`${getApiUrl()}/records`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("No se pudo crear la candidatura.");
	}

	return readJson<Candidate>(response);
}

export async function updateCandidate(
	id: string,
	data: CandidateFormData,
): Promise<Candidate> {
	const response = await sendRequest(
		`${getApiUrl()}/records/${encodeURIComponent(id)}`,
		{
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("No se pudo actualizar la candidatura.");
	}

	return readJson<Candidate>(response);
}

export async function patchCandidate(
	id: string,
	data: { status?: CandidateStatus; stage?: CandidateStage },
): Promise<Candidate> {
	const response = await sendRequest(
		`${getApiUrl()}/records/${encodeURIComponent(id)}`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("No se pudo actualizar el estado o la etapa de la candidatura.");
	}

	return readJson<Candidate>(response);
}

export async function getNotes(id: string): Promise<Note[]> {
	const response = await sendRequest(
		`${getApiUrl()}/records/${encodeURIComponent(id)}/notes`,
	);

	if (!response.ok) {
		throw new Error("No se pudieron obtener las notas.");
	}

	const notesResponse = await readJson<NotesResponse>(response);
	return notesResponse.data ?? [];
}

export async function addNote(id: string, content: string): Promise<void> {
	const response = await sendRequest(
		`${getApiUrl()}/records/${encodeURIComponent(id)}/notes`,
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
	const response = await sendRequest(
		`${getApiUrl()}/records/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`,
		{ method: "DELETE" },
	);

	if (!response.ok) {
		throw new Error("No se pudo eliminar la nota.");
	}
}
