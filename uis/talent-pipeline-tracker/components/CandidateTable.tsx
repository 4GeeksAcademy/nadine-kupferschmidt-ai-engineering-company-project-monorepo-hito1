import Link from "next/link";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { Candidate } from "@/types/candidate";

export default function CandidateTable({
	candidates,
}: {
	candidates: Candidate[];
}) {
	if (candidates.length === 0) {
		return <p>No hay candidaturas que coincidan con los filtros.</p>;
	}

	return (
		<table className="w-full border-collapse text-left">
			<thead>
				<tr className="border-b border-gray-300">
					<th className="px-4 py-3 font-semibold">Nombre</th>
					<th className="px-4 py-3 font-semibold">Puesto</th>
					<th className="px-4 py-3 font-semibold">Estado</th>
					<th className="px-4 py-3 font-semibold">Etapa</th>
				</tr>
			</thead>
			<tbody>
				{candidates.map((candidate) => (
					<tr key={candidate.id} className="border-b border-gray-200">
						<td className="px-4 py-3">
							<Link href={`/candidates/${candidate.id}`} className="text-blue-700 underline">
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
	);
}
