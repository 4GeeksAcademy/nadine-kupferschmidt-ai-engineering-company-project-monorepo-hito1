import { Suspense } from "react";
import Link from "next/link";
import CandidateList from "@/components/CandidateList";
import CandidateFilters from "@/components/CandidateFilters";

export default function Home() {
	return (
		<main className="mx-auto max-w-5xl p-6">
			<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-brand-darkbrown">
						Candidaturas
					</h1>
					<p className="text-sm text-brand-warmgray">
						Asistente de Dirección · Sede corporativa, Medellín
					</p>
				</div>
				<Link
					href="/candidates/new"
					className="rounded bg-brand-ochre px-4 py-2 text-brand-darkbrown hover:opacity-90"
				>
					+ Nueva candidatura
				</Link>
			</div>

			<Suspense fallback={<p>Cargando candidaturas…</p>}>
				<div className="mb-6">
					<CandidateFilters />
				</div>
				<CandidateList />
			</Suspense>
		</main>
	);
}