"use client";

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

	const { candidates, loading, error } = useCandidates({ status, stage, search });

	if (loading) {
		return <p>Cargando candidaturas…</p>;
	}

	if (error) {
		return <p className="text-red-600">Error: {error}</p>;
	}

	return <CandidateTable candidates={candidates} />;
}