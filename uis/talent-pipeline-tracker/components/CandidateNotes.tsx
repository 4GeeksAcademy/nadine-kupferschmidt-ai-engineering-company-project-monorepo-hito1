"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { addNote, deleteNote, getNotes } from "@/lib/api";
import type { Note } from "@/types/candidate";

type CandidateNotesProps = {
	candidateId: string;
};

export default function CandidateNotes({ candidateId }: CandidateNotesProps) {
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [newNote, setNewNote] = useState("");
	const [adding, setAdding] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

	useEffect(() => {
		const loadNotes = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await getNotes(candidateId);
				setNotes(response);
			} catch (caughtError) {
				setError(
					caughtError instanceof Error
						? caughtError.message
						: String(caughtError),
				);
			} finally {
				setLoading(false);
			}
		};

		void loadNotes();
	}, [candidateId]);

	async function handleAdd(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!newNote.trim()) {
			setActionError("Escribe el contenido de la nota antes de guardarla.");
			return;
		}

		setAdding(true);
		setActionError(null);

		try {
			await addNote(candidateId, newNote.trim());
			setNewNote("");
			const response = await getNotes(candidateId);
			setNotes(response);
		} catch (caughtError) {
			setActionError(
				caughtError instanceof Error
					? caughtError.message
					: String(caughtError),
			);
		} finally {
			setAdding(false);
		}
	}

	async function handleDelete() {
		if (noteToDelete === null) {
			return;
		}

		setDeletingId(noteToDelete);
		setActionError(null);

		try {
			await deleteNote(candidateId, noteToDelete);
			const response = await getNotes(candidateId);
			setNotes(response);
		} catch (caughtError) {
			setActionError(
				caughtError instanceof Error
					? caughtError.message
					: String(caughtError),
			);
		} finally {
			setDeletingId(null);
			setNoteToDelete(null);
		}
	}

	return (
		<section className="mt-6 rounded-md border border-brand-beige bg-white p-6">
			<h2 className="text-sm font-semibold uppercase tracking-wide text-brand-warmgray">
				Notas internas
			</h2>

			<form onSubmit={handleAdd} className="mt-4 space-y-3">
				<textarea
					aria-label="Nueva nota interna"
					value={newNote}
					onChange={(event) => setNewNote(event.target.value)}
					placeholder="Escribe una nota sobre la llamada o entrevista…"
					rows={3}
					className="w-full rounded border border-brand-beige px-3 py-2"
				/>
				<button
					type="submit"
					disabled={adding}
					className="rounded bg-brand-ochre px-4 py-2 text-sm text-brand-darkbrown disabled:opacity-60"
				>
					{adding ? "Guardando…" : "Agregar nota"}
				</button>
			</form>

			{actionError && (
				<p className="mt-3 text-sm text-red-600" role="alert">
					{actionError}
				</p>
			)}

			<div className="mt-4" aria-live="polite">
				{loading ? (
					<p>Cargando notas…</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : notes.length === 0 ? (
					<p>Todavía no hay notas internas.</p>
				) : (
					<ul>
						{notes.map((note) => (
							<li key={note.id} className="border-t border-brand-beige py-3">
								<p className="whitespace-pre-wrap break-words">{note.content}</p>
								<p className="mt-1 text-xs text-brand-warmgray">
									{new Date(note.created_at).toLocaleString("es-CO", {
										day: "numeric",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
								<button
									type="button"
									disabled={deletingId === note.id}
									onClick={() => setNoteToDelete(note.id)}
									className="text-sm text-red-600 hover:underline"
								>
									{deletingId === note.id ? "Eliminando…" : "Eliminar"}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
			<ConfirmDialog
				open={noteToDelete !== null}
				title="Eliminar nota"
				message="Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta nota?"
				confirmLabel="Eliminar"
				loading={deletingId !== null}
				onConfirm={() => void handleDelete()}
				onCancel={() => setNoteToDelete(null)}
			/>
		</section>
	);
}