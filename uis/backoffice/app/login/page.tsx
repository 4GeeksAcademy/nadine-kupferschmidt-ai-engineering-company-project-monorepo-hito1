"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setToken } from "@/lib/auth";

type LoginResponse = {
  access_token: string;
  token_type: string;
};

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
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center justify-center py-8">
      <section className="w-full rounded-[18px] border border-bo-border bg-bo-surface p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="mb-2 font-serif text-xl font-semibold tracking-wide text-bo-logo">
            Brasaland
          </p>
          <h1 className="text-2xl font-semibold text-bo-text">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-bo-muted">
            Ingresá tus datos para acceder al backoffice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-bo-text"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-bo-border bg-bo-surface px-4 text-sm text-bo-text outline-none focus-visible:border-bo-text focus-visible:ring-2 focus-visible:ring-bo-accent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-bo-text"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-bo-border bg-bo-surface px-4 text-sm text-bo-text outline-none focus-visible:border-bo-text focus-visible:ring-2 focus-visible:ring-bo-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-bo-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-bo-muted">
          ¿Todavía no tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-bo-text underline underline-offset-4 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
          >
            Crear una cuenta
          </Link>
        </p>
      </section>
    </div>
  );
}
