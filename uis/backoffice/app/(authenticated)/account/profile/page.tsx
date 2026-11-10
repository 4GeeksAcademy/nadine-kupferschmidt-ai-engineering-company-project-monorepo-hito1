"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, SESSION_EXPIRED_MESSAGE } from "@/lib/api";

type Profile = {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
};

type CurrentUser = {
  id: string;
  email: string;
  role: string;
  profile: Profile | null;
};

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
};

const inputClassName =
  "min-h-11 w-full rounded-[10px] border border-bo-border bg-bo-surface px-3 py-2 text-sm text-bo-text outline-none focus-visible:border-bo-text focus-visible:ring-2 focus-visible:ring-bo-accent";

const LOAD_ERROR = "No pudimos cargar tu perfil.";
const SAVE_ERROR = "No pudimos guardar tus cambios. Intenta de nuevo.";

// Traduce un error HTTP a un mensaje legible; nunca expone el código ni el JSON crudo.
async function messageForResponse(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) return SESSION_EXPIRED_MESSAGE;
  if (response.status === 400 || response.status === 422) {
    const payload = (await response.json().catch(() => null)) as { detail?: unknown } | null;
    return typeof payload?.detail === "string" ? payload.detail : "Revisa los datos del formulario.";
  }
  if (response.status >= 500) return "Algo falló en el servidor. Intenta de nuevo en unos minutos.";
  return fallback;
}

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await apiFetch("/api/auth/me");
        if (!response.ok) {
          throw new Error(await messageForResponse(response, LOAD_ERROR));
        }
        const user = (await response.json().catch(() => null)) as CurrentUser | null;
        if (!user) {
          throw new Error(LOAD_ERROR);
        }
        if (active) {
          setEmail(user.email ?? "");
          setForm({
            name: user.profile?.name ?? "",
            phone: user.profile?.phone ?? "",
            address: user.profile?.address ?? "",
          });
          setLoaded(true);
        }
      } catch (cause) {
        if (active) {
          setLoadError(cause instanceof Error ? cause.message : LOAD_ERROR);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [attempt]);

  function retryLoad() {
    setLoading(true);
    setLoadError("");
    setAttempt((current) => current + 1);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let response: Response;
      try {
        response = await apiFetch("/api/profiles/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            address: form.address,
          }),
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : SAVE_ERROR);
        return;
      }

      if (!response.ok) {
        setError(await messageForResponse(response, SAVE_ERROR));
        return;
      }

      const profile = (await response.json().catch(() => null)) as Profile | null;
      if (profile) {
        setForm({
          name: profile.name ?? "",
          phone: profile.phone ?? "",
          address: profile.address ?? "",
        });
      }
      setSuccess("Perfil actualizado.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p role="status" className="text-sm text-bo-muted">
        Cargando…
      </p>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-bo-muted">
          Cuenta / Perfil
        </p>
        <h1 className="text-3xl font-semibold text-bo-text">Mi perfil</h1>
        <Link
          href="/account/change-password"
          className="mt-3 inline-block text-sm font-medium text-bo-text underline underline-offset-4 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
        >
          Cambiar contraseña
        </Link>
      </header>

      {error && (
        <p role="alert" className="mb-5 text-sm text-bo-danger">
          {error}
          {error === SESSION_EXPIRED_MESSAGE && (
            <>
              {" "}
              <Link href="/login" className="underline underline-offset-4">
                Iniciar sesión
              </Link>
            </>
          )}
        </p>
      )}

      {loadError && (
        <div
          role="alert"
          className="space-y-4 rounded-[18px] border border-bo-border bg-bo-surface p-5 text-sm text-bo-danger"
        >
          <p>{loadError}</p>
          <div className="flex flex-wrap items-center gap-4">
            {loadError === SESSION_EXPIRED_MESSAGE ? (
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90"
              >
                Iniciar sesión
              </Link>
            ) : (
              <button
                type="button"
                onClick={retryLoad}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90"
              >
                Intentar de nuevo
              </button>
            )}
            <Link
              href="/"
              className="text-sm font-medium text-bo-text underline underline-offset-4"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      )}

      {!loading && !loadError && loaded && (
        <form
          onSubmit={saveProfile}
          className="space-y-5 rounded-[18px] border border-bo-border bg-bo-surface p-5"
        >
          <label className="flex flex-col gap-1 text-sm text-bo-muted">
            Email
            <input
              type="email"
              value={email}
              readOnly
              aria-describedby="email-help"
              className={`${inputClassName
                .replace("bg-bo-surface", "bg-bo-chip")
                .replace("text-bo-text", "text-bo-muted")} cursor-not-allowed`}
            />
            <span id="email-help" className="text-xs">
              El email no se puede modificar desde el perfil.
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-bo-muted">
            Nombre
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-bo-muted">
            Teléfono
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              className={inputClassName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-bo-muted">
            Dirección
            <input
              type="text"
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({ ...current, address: event.target.value }))
              }
              className={inputClassName}
            />
          </label>

          {success && (
            <p role="status" className="text-sm text-bo-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
}
