"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CandidateForm from "@/components/CandidateForm";
import { createCandidate } from "@/lib/api";
import type { CandidateFormData } from "@/types/candidate";

export default function NewCandidatePage() {
	const router = useRouter();

	async function handleCreate(data: CandidateFormData) {
		const created = await createCandidate(data);
		router.push(`/candidates/${created.id}`);
	}

	return (
		<main className="mx-auto w-full max-w-5xl p-6">
			<Link
				href="/"
				className="mb-4 inline-block text-sm text-brand-warmgray hover:text-brand-ochre"
			>
				← Volver al listado
			</Link>

			<h1 className="text-2xl font-semibold text-brand-darkbrown">
				Nueva candidatura
			</h1>
			<p className="mb-6 text-sm text-brand-warmgray">
				Registra candidatos que llegan por otras vías (referidos, correo, LinkedIn…).
			</p>

			<div className="rounded-md border border-brand-beige bg-white p-6">
				<CandidateForm submitLabel="Registrar candidatura" onSubmit={handleCreate} />
			</div>
		</main>
	);
}