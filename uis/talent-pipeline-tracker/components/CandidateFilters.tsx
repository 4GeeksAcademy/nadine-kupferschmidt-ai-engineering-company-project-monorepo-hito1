"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels";

export default function CandidateFilters() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const [search, setSearch] = useState(searchParams.get("search") ?? "");

	function updateParams(updates: Record<string, string | null | undefined>) {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(updates).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		updateParams({ search });
	}

	function clearFilters() {
		updateParams({ status: "", stage: "", search: "" });
		setSearch("");
	}

	return (
		<div className="flex flex-wrap items-end gap-4">
			<div className="flex flex-col gap-1">
				<label htmlFor="candidate-status" className="text-sm text-brand-warmgray">
					Estado
				</label>
				<select
					id="candidate-status"
					value={searchParams.get("status") ?? ""}
					onChange={(event) => updateParams({ status: event.target.value })}
					className="rounded border border-brand-beige bg-white px-3 py-2 text-brand-warmgray"
				>
					<option value="">Todos los estados</option>
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
					value={searchParams.get("stage") ?? ""}
					onChange={(event) => updateParams({ stage: event.target.value })}
					className="rounded border border-brand-beige bg-white px-3 py-2 text-brand-warmgray"
				>
					<option value="">Todas las etapas</option>
					{Object.entries(STAGE_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-1">
				<label htmlFor="candidate-search" className="text-sm text-brand-warmgray">
					Búsqueda
				</label>
				<div className="flex gap-2">
					<input
						id="candidate-search"
						type="search"
						placeholder="Buscar por nombre o email"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						className="min-w-56 rounded border border-brand-beige bg-white px-3 py-2 text-brand-warmgray"
					/>
					<button
						type="submit"
						className="rounded bg-brand-ochre px-4 py-2 text-brand-darkbrown"
					>
						Buscar
					</button>
				</div>
			</form>

			<button
				type="button"
				onClick={clearFilters}
				className="rounded border border-brand-beige bg-white px-4 py-2 text-brand-warmgray"
			>
				Limpiar filtros
			</button>
		</div>
	);
}
