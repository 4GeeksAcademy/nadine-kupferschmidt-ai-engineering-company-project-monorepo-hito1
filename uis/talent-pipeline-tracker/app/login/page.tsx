"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setToken } from "@/lib/auth";

type LoginResponse = {
	access_token: string;
	token_type: string;
};

const labelClass = "text-sm text-brand-warmgray";
const inputClass = "rounded border border-brand-beige bg-white px-3 py-2";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({ username: email, password }),
			});

			if (response.status === 401) {
				setError("Email o contraseña incorrectos.");
				return;
			}
			if (!response.ok) {
				throw new Error("No se pudo iniciar sesión. Intentá de nuevo.");
			}

			const data = (await response.json()) as LoginResponse;
			if (!data.access_token) {
				throw new Error("No se pudo iniciar sesión. Intentá de nuevo.");
			}

			setToken(data.access_token);
			router.replace("/");
		} catch {
			setError("Ocurrió un error al iniciar sesión. Intentá de nuevo.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 items-center p-6">
			<section className="w-full rounded-md border border-brand-beige bg-white p-6">
				<h1 className="text-2xl font-semibold text-brand-darkbrown">Iniciar sesión</h1>
				<p className="mt-1 text-sm text-brand-warmgray">
					Ingresá tus datos para acceder al proceso de selección.
				</p>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<div className="flex flex-col gap-1">
						<label htmlFor="email" className={labelClass}>Email</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className={inputClass}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label htmlFor="password" className={labelClass}>Contraseña</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className={inputClass}
						/>
					</div>

					{error && (
						<p role="alert" className="text-sm text-red-600">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded bg-brand-ochre px-4 py-2 text-sm text-brand-darkbrown hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Ingresando…" : "Iniciar sesión"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-brand-warmgray">
					¿No tenés cuenta? Creala desde el backoffice de Brasaland.
				</p>
			</section>
		</main>
	);
}
