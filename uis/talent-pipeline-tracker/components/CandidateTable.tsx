import Link from "next/link";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { Candidate } from "@/types/candidate";

export default function CandidateTable({
	candidates,
}: {
	candidates: Candidate[];
}) {
	if (candidates.length === 0) {
		return <p className="rounded-md border border-brand-beige bg-white p-6 text-center text-brand-warmgray">No hay candidaturas que coincidan con los filtros.</p>;
	}

	return (
		<div className="overflow-x-auto rounded-md border border-brand-beige bg-white">
			<table className="w-full border-collapse text-left">
				<thead>
					<tr className="bg-brand-beige">
						<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-warmgray">Nombre</th>
						<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-warmgray">Puesto</th>
						<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-warmgray">Estado</th>
						<th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-warmgray">Etapa</th>
					</tr>
				</thead>
				<tbody>
					{candidates.map((candidate) => (
						<tr key={candidate.id} className="border-t border-brand-beige hover:bg-brand-ivory">
							<td className="px-4 py-3">
								<Link href={`/candidates/${candidate.id}`} className="font-medium text-brand-darkbrown hover:text-brand-ochre">
									{candidate.full_name}
								</Link>
							</td>
							<td className="px-4 py-3">{candidate.position}</td>
							<td className="px-4 py-3">
								{STATUS_LABELS[candidate.status]}
							</td>
							<td className="px-4 py-3">
								{STAGE_LABELS[candidate.stage]}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
