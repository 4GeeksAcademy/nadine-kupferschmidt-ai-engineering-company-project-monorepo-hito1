"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";

type AuthGuardProps = {
	children: ReactNode;
};

type Status = "checking" | "ok" | "error";

export default function AuthGuard({ children }: AuthGuardProps) {
	const router = useRouter();
	const [status, setStatus] = useState<Status>("checking");
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		const token = getToken();
		if (!token) {
			router.replace("/login");
			return;
		}

		let cancelled = false;

		async function verifySession() {
			try {
				const response = await fetch("/api/auth/me", {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (cancelled) return;

				if (response.status === 401) {
					clearToken();
					router.replace("/login");
					return;
				}
				setStatus(response.ok ? "ok" : "error");
			} catch {
				if (!cancelled) setStatus("error");
			}
		}

		verifySession();

		return () => {
			cancelled = true;
		};
	}, [router, reloadKey]);

	if (status === "error") {
		return (
			<main className="mx-auto w-full max-w-5xl flex-1 p-6">
				<p role="alert" className="text-sm text-red-600">
					No se pudo verificar la sesión.
				</p>
				<div className="mt-4 flex flex-wrap items-center gap-4">
					<button
						type="button"
						onClick={() => {
							setStatus("checking");
							setReloadKey((key) => key + 1);
						}}
						className="rounded bg-brand-ochre px-4 py-2 text-sm text-brand-darkbrown hover:opacity-90"
					>
						Intentar de nuevo
					</button>
					<Link href="/login" className="text-sm text-brand-warmgray hover:text-brand-ochre">
						Ir a iniciar sesión
					</Link>
				</div>
			</main>
		);
	}

	if (status !== "ok") {
		return null;
	}

	return children;
}
