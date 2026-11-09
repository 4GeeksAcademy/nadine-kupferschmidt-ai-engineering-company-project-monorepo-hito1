"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const inputClassName =
  "min-h-11 w-full rounded-xl border border-bo-border bg-bo-surface px-4 text-sm text-bo-text outline-none focus-visible:border-bo-text focus-visible:ring-2 focus-visible:ring-bo-accent";

const linkClassName =
  "font-medium text-bo-text underline underline-offset-4 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setIsSent(true);
    } catch {
      setError("No pudimos conectarnos. Intentá de nuevo.");
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
          <h1 className="text-2xl font-semibold text-bo-text">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-bo-muted">
            Ingresá tu email y te enviaremos un enlace para crear una nueva
            contraseña.
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
              disabled={isSent}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
            />
          </div>

          {isSent && (
            <p role="status" className="text-sm text-bo-success">
              Si esa dirección está registrada, recibirás un enlace en breve.
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-bo-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSent}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-bo-muted">
          <Link href="/login" className={linkClassName}>
            Volver a iniciar sesión
          </Link>
        </p>
      </section>
    </div>
  );
}
