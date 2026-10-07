"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCandidate } from "@/hooks/useCandidate";
import CandidateForm from "@/components/CandidateForm";
import CandidateStatusControls from "@/components/CandidateStatusControls";
import CandidateNotes from "@/components/CandidateNotes";
import { updateCandidate } from "@/lib/api";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { CandidateFormData } from "@/types/candidate";

export default function CandidateDetail({ id }: { id: string }) {
	const router = useRouter();
	const { candidate, loading, error, setCandidate } = useCandidate(id);
	const [isEditing, setIsEditing] = useState(false);
	const [editSuccess, setEditSuccess] = useState<string | null>(null);

	if (loading) {
		return <p>Cargando candidatura…</p>;
	}

	if (error) {
		return <p className="text-red-600">Error: {error}</p>;
	}

	if (!candidate) {
		return <p>No se encontró la candidatura.</p>;
	}

	async function handleUpdate(data: CandidateFormData) {
		if (!candidate) return;

		const updated = await updateCandidate(candidate.id, data);
		setCandidate(updated);
		setIsEditing(false);
		setEditSuccess("Datos actualizados correctamente.");
	}

	return (
		<div>
			<button
				type="button"
				onClick={() => router.back()}
				className="mb-4 text-sm text-brand-warmgray hover:text-brand-ochre"
			>
				← Volver al listado
			</button>

			<h1 className="text-2xl font-semibold text-brand-darkbrown">
				{candidate.full_name}
			</h1>
			<p className="text-brand-warmgray">{candidate.position}</p>
			{!isEditing && (
				<button
					type="button"
					onClick={() => {
						setIsEditing(true);
						setEditSuccess(null);
					}}
					className="mt-4 rounded bg-brand-ochre px-4 py-2 text-sm text-brand-darkbrown hover:opacity-90"
				>
					Editar datos
				</button>
			)}
			{editSuccess && (
				<p className="mt-3 text-sm text-green-700">{editSuccess}</p>
			)}

			{isEditing ? (
				<div className="mt-6 rounded-md border border-brand-beige bg-white p-6">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-warmgray">
						Editar datos
					</h2>
					<CandidateForm
						initialValues={candidate}
						submitLabel="Guardar cambios"
						onSubmit={handleUpdate}
						onCancel={() => setIsEditing(false)}
					/>
				</div>
			) : (
				<div className="mt-6 rounded-md border border-brand-beige bg-white p-6">
				<dl className="grid gap-4 sm:grid-cols-2">
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							Email
						</dt>
						<dd>
							<a
								href={`mailto:${candidate.email}`}
								className="text-brand-darkbrown underline hover:text-brand-ochre"
							>
								{candidate.email}
							</a>
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							Teléfono
						</dt>
						<dd>{candidate.phone}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							Puesto
						</dt>
						<dd>{candidate.position}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							LinkedIn
						</dt>
						<dd>
							{candidate.linkedin_url ? (
								<a
									href={candidate.linkedin_url}
									target="_blank"
									rel="noreferrer"
									className="text-brand-darkbrown underline hover:text-brand-ochre"
								>
									Ver perfil
								</a>
							) : (
								"No indicado"
							)}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							CV
						</dt>
						<dd>
							{candidate.cv_url ? (
								<a
									href={candidate.cv_url}
									target="_blank"
									rel="noreferrer"
									className="text-brand-darkbrown underline hover:text-brand-ochre"
								>
									Ver CV
								</a>
							) : (
								"No indicado"
							)}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							Años de experiencia
						</dt>
						<dd>{candidate.experience_years} años</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							Estado
						</dt>
						<dd>{STATUS_LABELS[candidate.status]}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							Etapa
						</dt>
						<dd>{STAGE_LABELS[candidate.stage]}</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-brand-warmgray">
							Fecha de postulación
						</dt>
						<dd>
							{new Date(candidate.applied_at).toLocaleDateString("es-CO", {
								day: "numeric",
								month: "long",
							year: "numeric",
							})}
						</dd>
					</div>
				</dl>
				</div>
			)}
			<CandidateStatusControls candidate={candidate} onUpdated={setCandidate} />
			<CandidateNotes candidateId={candidate.id} />
		</div>
	);
}
