import { Suspense } from "react";
import CandidateList from "@/components/CandidateList";

export default function Home() {
	return (
		<main className="mx-auto max-w-5xl p-6">
			<h1 className="text-2xl font-bold">Brasaland · Proceso de selección</h1>
			<p className="mb-6 text-gray-600">
				Asistente de Dirección — Sede corporativa, Medellín
			</p>

			<Suspense fallback={<p>Cargando candidaturas…</p>}>
				<CandidateList />
			</Suspense>
		</main>
	);
}