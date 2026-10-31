import { Suspense } from "react";
import CandidateList from "@/components/CandidateList";
import CandidateFilters from "@/components/CandidateFilters";

export default function Home() {
	return (
		<main className="mx-auto max-w-5xl p-6">
			<div className="mb-6">
				<div>
					<h1 className="text-2xl font-semibold text-brand-darkbrown">
						Candidaturas
					</h1>
					<p className="text-sm text-brand-warmgray">
						Asistente de Dirección · Sede corporativa, Medellín
					</p>
				</div>
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