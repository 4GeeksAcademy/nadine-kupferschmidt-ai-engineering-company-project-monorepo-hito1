"use client";

import { useState } from "react";
import { patchCandidate } from "@/lib/api";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { Candidate, CandidateStage, CandidateStatus } from "@/types/candidate";

type CandidateStatusControlsProps = {
	candidate: Candidate;
	onUpdated: (candidate: Candidate) => void;
};

export default function CandidateStatusControls({
	candidate,
	onUpdated,
}: CandidateStatusControlsProps) {
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function handleChange(changes: {
		status?: CandidateStatus;
		stage?: CandidateStage;
	}) {
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const updatedCandidate = await patchCandidate(candidate.id, changes);
			onUpdated(updatedCandidate);
			setSuccess("Cambios guardados");
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: String(caughtError),
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<section className="mt-6 rounded-md border border-brand-beige bg-white p-6">
			<h2 className="text-sm font-semibold uppercase tracking-wide text-brand-warmgray">
				Estado del proceso
			</h2>

			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1">
					<label htmlFor="candidate-status" className="text-sm text-brand-warmgray">
						Estado
					</label>
					<select
						id="candidate-status"
						value={candidate.status}
						disabled={saving}
						onChange={(event) =>
							void handleChange({ status: event.target.value as CandidateStatus })
						}
						className="rounded border border-brand-beige bg-white px-3 py-2"
					>
						{Object.entries(STATUS_LABELS).map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="candidate-stage" className="text-sm text-brand-warmgray">
						Etapa
					</label>
					<select
						id="candidate-stage"
						value={candidate.stage}
						disabled={saving}
						onChange={(event) =>
							void handleChange({ stage: event.target.value as CandidateStage })
						}
						className="rounded border border-brand-beige bg-white px-3 py-2"
					>
						{Object.entries(STAGE_LABELS).map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="mt-4 space-y-1 text-sm" aria-live="polite">
				{saving && <p>Guardando…</p>}
				{success && <p className="text-green-700">{success}</p>}
				{error && <p className="text-red-600">{error}</p>}
			</div>
		</section>
	);
}
