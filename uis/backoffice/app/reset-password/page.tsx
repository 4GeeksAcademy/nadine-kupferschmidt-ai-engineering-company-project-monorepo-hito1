"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

const inputClassName =
  "min-h-11 w-full rounded-xl border border-bo-border bg-bo-surface px-4 text-sm text-bo-text outline-none focus-visible:border-bo-text focus-visible:ring-2 focus-visible:ring-bo-accent";

const linkClassName =
  "font-medium text-bo-text underline underline-offset-4 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text";

const GENERIC_ERROR = "No se pudo restablecer la contraseña. Intentá de nuevo.";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  if (!token) {
    return (
      <section className="w-full rounded-[18px] border border-bo-border bg-bo-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-bo-text">
          Restablecer contraseña
        </h1>
        <p role="alert" className="mt-4 text-sm text-bo-danger">
          El enlace no es válido.
        </p>
        <p className="mt-6 text-center text-sm text-bo-muted">
          <Link href="/forgot-password" className={linkClassName}>
            Pedir un enlace nuevo
          </Link>
        </p>
      </section>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsExpired(false);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (response.ok) {
        router.replace("/login?reset=success");
        return;
      }
      if (response.status === 400) {
        setIsExpired(true);
        setError("Este enlace expiró o ya fue utilizado. Solicitá uno nuevo.");
        return;
      }
      if (response.status === 422) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      setError(GENERIC_ERROR);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full rounded-[18px] border border-bo-border bg-bo-surface p-6 shadow-sm sm:p-8">
      <div className="mb-7">
        <p className="mb-2 font-serif text-xl font-semibold tracking-wide text-bo-logo">
          Brasaland
        </p>
        <h1 className="text-2xl font-semibold text-bo-text">
          Restablecer contraseña
        </h1>
        <p className="mt-2 text-sm text-bo-muted">
          Elegí una nueva contraseña para tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="new-password"
            className="mb-2 block text-sm font-medium text-bo-text"
          >
            Nueva contraseña
          </label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm font-medium text-bo-text"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClassName}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-bo-danger">
            {error}
          </p>
        )}

        {isExpired && (
          <p className="text-center text-sm text-bo-muted">
            <Link href="/forgot-password" className={linkClassName}>
              Pedir un enlace nuevo
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Guardando…" : "Restablecer contraseña"}
        </button>
      </form>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center justify-center py-8">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
