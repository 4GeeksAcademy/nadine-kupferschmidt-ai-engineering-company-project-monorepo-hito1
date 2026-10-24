import CandidateDetail from "@/components/CandidateDetail";

export default async function CandidatePage({
	params,
	searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
	const { id } = await params;
	const { created } = await searchParams;

	return (
		<main className="mx-auto w-full max-w-5xl p-6">
			<CandidateDetail id={id} justCreated={created === "1"} />
		</main>
	);
}
