"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export default function LogoutButton() {
	const router = useRouter();

	function handleLogout() {
		clearToken();
		router.replace("/login");
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			className="rounded border border-brand-beige bg-white px-3 py-1.5 text-brand-darkbrown hover:border-brand-ochre"
		>
			Cerrar sesión
		</button>
	);
}
