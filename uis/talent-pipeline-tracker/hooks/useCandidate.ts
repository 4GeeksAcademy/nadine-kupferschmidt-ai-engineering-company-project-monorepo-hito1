"use client";

import { useEffect, useState } from "react";
import { getCandidateById } from "@/lib/api";
import type { Candidate } from "@/types/candidate";

export function useCandidate(id: string) {
	const [candidate, setCandidate] = useState<Candidate | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		const loadCandidate = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await getCandidateById(id);
				setCandidate(response);
			} catch (caughtError) {
				setError(
					caughtError instanceof Error
						? caughtError.message
						: "No se pudo cargar la candidatura.",
				);
			} finally {
				setLoading(false);
			}
		};

		void loadCandidate();
	}, [id, reloadKey]);

	return {
		candidate,
		setCandidate,
		loading,
		error,
		reload: () => setReloadKey((key) => key + 1),
	};
}
