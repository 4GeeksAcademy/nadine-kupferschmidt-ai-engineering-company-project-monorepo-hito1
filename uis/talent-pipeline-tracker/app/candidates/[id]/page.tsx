import CandidateDetail from "@/components/CandidateDetail";

export default async function CandidatePage({
	params,
}: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return (
		<main className="mx-auto w-full max-w-5xl p-6">
			<CandidateDetail id={id} />
		</main>
	);
}
