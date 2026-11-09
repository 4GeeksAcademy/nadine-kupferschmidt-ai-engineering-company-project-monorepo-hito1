"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

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

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await apiFetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("No se pudo cargar el perfil.");
        }
        const user = (await response.json()) as CurrentUser;
        if (active) {
          setEmail(user.email);
          setForm({
            name: user.profile?.name ?? "",
            phone: user.profile?.phone ?? "",
            address: user.profile?.address ?? "",
          });
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudo cargar el perfil.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch("/api/profiles/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
        }),
      });
      if (!response.ok) {
        throw new Error("No se pudo actualizar el perfil.");
      }

      const profile = (await response.json()) as Profile;
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
      setSuccess("Perfil actualizado.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo actualizar el perfil.",
      );
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
        </p>
      )}

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
    </div>
  );
}
