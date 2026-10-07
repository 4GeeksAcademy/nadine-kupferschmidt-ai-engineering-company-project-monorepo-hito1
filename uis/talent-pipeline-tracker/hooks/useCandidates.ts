"use client";

import { useEffect, useState } from "react";
import { getCandidates } from "@/lib/api";
import type {
	Candidate,
	CandidateStage,
	CandidateStatus,
} from "@/types/candidate";

export function useCandidates({
	status,
	stage,
	search,
}: {
	status?: CandidateStatus;
	stage?: CandidateStage;
	search?: string;
}) {
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadCandidates = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await getCandidates({ status, stage, search });
				setCandidates(response.data);
				setTotal(response.total);
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

		void loadCandidates();
	}, [status, stage, search]);

	return { candidates, loading, error, total };
}
