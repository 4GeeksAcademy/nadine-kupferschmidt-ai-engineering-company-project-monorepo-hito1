"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import CandidateTable from "@/components/CandidateTable";
import { useCandidates } from "@/hooks/useCandidates";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { CandidateStage, CandidateStatus } from "@/types/candidate";

export default function CandidateList() {
	const searchParams = useSearchParams();

	const statusParam = searchParams.get("status");
	const stageParam = searchParams.get("stage");
	const searchParam = searchParams.get("search");

	const status =
		statusParam && Object.keys(STATUS_LABELS).includes(statusParam)
			? (statusParam as CandidateStatus)
			: undefined;

	const stage =
		stageParam && Object.keys(STAGE_LABELS).includes(stageParam)
			? (stageParam as CandidateStage)
			: undefined;

	const search = searchParam || undefined;

	const { candidates, loading, error, total } = useCandidates({ status, stage, search });
	const [showAll, setShowAll] = useState(false);

	if (loading) {
		return <p>Cargando candidaturas…</p>;
	}

	if (error) {
		return <p className="text-red-600">Error: {error}</p>;
	}

	const visibleCandidates = showAll ? candidates : candidates.slice(0, 15);

	return (
		<div>
			<p className="mb-3 text-sm text-brand-warmgray">
				{visibleCandidates.length < total ? (
					`Mostrando ${visibleCandidates.length} de ${total} candidaturas`
				) : (
					<>{total} {total === 1 ? "candidatura" : "candidaturas"}</>
				)}
			</p>
			<CandidateTable candidates={visibleCandidates} />
			{candidates.length > 15 && (
				<div className="mt-4 flex justify-center">
					<button
						onClick={() => setShowAll(!showAll)}
						className="rounded border border-brand-beige bg-white px-4 py-2 text-sm text-brand-darkbrown hover:border-brand-ochre"
					>
						{showAll ? "Ver menos" : `Ver todas (${candidates.length})`}
					</button>
				</div>
			)}
		</div>
	);
}