"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import PasswordInput from "@/components/PasswordInput";
import { setToken } from "@/lib/auth";

type ApiValidationError = {
  loc?: unknown[];
  msg?: unknown;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

type FieldErrors = Partial<
  Record<"email" | "password" | "name" | "phone" | "address", string[]>
>;

const inputClassName =
  "min-h-11 w-full rounded-xl border border-bo-border bg-bo-surface px-4 text-sm text-bo-text outline-none focus-visible:border-bo-text focus-visible:ring-2 focus-visible:ring-bo-accent";

const CONNECTION_ERROR =
  "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
const AUTO_LOGIN_ERROR =
  "Tu cuenta se creó, pero no pudimos iniciar sesión automáticamente.";

function registerErrorMessage(status: number, detail: unknown): string {
  if (status >= 500) return "Algo falló en el servidor. Intentá de nuevo en unos minutos.";
  if (status === 400 && typeof detail === "string") return detail;
  return "No pudimos crear la cuenta. Intentá de nuevo.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [showLoginLink, setShowLoginLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setApiValidationErrors(detail: unknown) {
    if (!Array.isArray(detail)) {
      setGeneralError("Revisá los datos ingresados e intentá de nuevo.");
      return;
    }

    const errors: FieldErrors = {};
    for (const item of detail as ApiValidationError[]) {
      if (!item || !Array.isArray(item.loc) || typeof item.msg !== "string") {
        continue;
      }

      const field = item.loc.find(
        (part) =>
          part === "email" ||
          part === "password" ||
          part === "name" ||
          part === "phone" ||
          part === "address",
      );
      if (
        field === "email" ||
        field === "password" ||
        field === "name" ||
        field === "phone" ||
        field === "address"
      ) {
        errors[field] = [...(errors[field] ?? []), item.msg];
      }
    }

    if (Object.keys(errors).length === 0) {
      setGeneralError("Revisá los datos ingresados e intentá de nuevo.");
    } else {
      setFieldErrors(errors);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setConfirmPasswordError("");
    setGeneralError("");
    setShowLoginLink(false);

    const validationErrors: FieldErrors = {};
    if (password.length < 8) {
      validationErrors.password = ["La contraseña debe tener al menos 8 caracteres."];
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("La confirmación no coincide con la contraseña.");
    }
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let registerResponse: Response;
      try {
        registerResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            ...(name.trim() ? { name: name.trim() } : {}),
            ...(phone.trim() ? { phone: phone.trim() } : {}),
            ...(address.trim() ? { address: address.trim() } : {}),
          }),
        });
      } catch {
        setGeneralError(CONNECTION_ERROR);
        return;
      }

      if (registerResponse.status === 409) {
        setGeneralError("Ya existe una cuenta con ese email.");
        setShowLoginLink(true);
        return;
      }

      const payload = (await registerResponse.json().catch(() => null)) as {
        detail?: unknown;
      } | null;
      if (registerResponse.status === 422) {
        setApiValidationErrors(payload?.detail);
        return;
      }
      if (!registerResponse.ok) {
        setGeneralError(registerErrorMessage(registerResponse.status, payload?.detail));
        return;
      }

      try {
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username: email, password }),
        });
        const loginData = (await loginResponse.json().catch(() => null)) as LoginResponse | null;
        if (!loginResponse.ok || !loginData?.access_token) {
          throw new Error("No se pudo iniciar sesión.");
        }

        setToken(loginData.access_token);
        router.replace("/");
      } catch {
        setGeneralError(AUTO_LOGIN_ERROR);
        setShowLoginLink(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderFieldErrors(field: keyof FieldErrors) {
    return fieldErrors[field]?.map((message, index) => (
      <p key={`${field}-${index}`} className="mt-1 text-sm text-bo-danger">
        {message}
      </p>
    ));
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center justify-center py-8">
      <section className="w-full rounded-[18px] border border-bo-border bg-bo-surface p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="mb-2 font-serif text-xl font-semibold tracking-wide text-bo-logo">
            Brasaland
          </p>
          <h1 className="text-2xl font-semibold text-bo-text">Crear una cuenta</h1>
          <p className="mt-2 text-sm text-bo-muted">
            Completá tus datos para acceder al backoffice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-bo-text">
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
              className={inputClassName}
              aria-invalid={Boolean(fieldErrors.email?.length)}
              aria-describedby={fieldErrors.email?.length ? "email-errors" : undefined}
            />
            {fieldErrors.email?.length ? (
              <div id="email-errors">{renderFieldErrors("email")}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-bo-text">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(fieldErrors.password?.length)}
              aria-describedby={fieldErrors.password?.length ? "password-errors" : undefined}
            />
            {fieldErrors.password?.length ? (
              <div id="password-errors">{renderFieldErrors("password")}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-bo-text">
              Confirmar contraseña
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(confirmPasswordError)}
              aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
            />
            {confirmPasswordError ? (
              <p id="confirm-password-error" className="mt-1 text-sm text-bo-danger">
                {confirmPasswordError}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-bo-text">
              Nombre <span className="font-normal text-bo-muted">(opcional)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(fieldErrors.name?.length)}
            />
            {renderFieldErrors("name")}
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-bo-text">
              Teléfono <span className="font-normal text-bo-muted">(opcional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(fieldErrors.phone?.length)}
            />
            {renderFieldErrors("phone")}
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-bo-text">
              Dirección <span className="font-normal text-bo-muted">(opcional)</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={inputClassName}
              aria-invalid={Boolean(fieldErrors.address?.length)}
            />
            {renderFieldErrors("address")}
          </div>

          {generalError && (
            <p role="alert" className="text-sm text-bo-danger">
              {generalError}
              {showLoginLink && (
                <>
                  {" "}
                  <Link href="/login" className="font-medium underline underline-offset-4">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-bo-muted">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-bo-text underline underline-offset-4 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
          >
            Iniciar sesión
          </Link>
        </p>
      </section>
    </div>
  );
}
