"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

const inputClassName =
  "min-h-11 w-full rounded-[10px] border border-bo-border bg-bo-surface px-3 py-2 text-sm text-bo-text outline-none focus-visible:border-bo-text focus-visible:ring-2 focus-visible:ring-bo-accent";

const GENERIC_ERROR = "No se pudo actualizar la contraseña. Intentá de nuevo.";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setSuccess("Tu contraseña se actualizó correctamente.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        return;
      }
      if (response.status === 400) {
        setError("La contraseña actual es incorrecta.");
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
      setSaving(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-bo-muted">
          Cuenta / Cambiar contraseña
        </p>
        <h1 className="text-3xl font-semibold text-bo-text">
          Cambiar contraseña
        </h1>
      </header>

      {error && (
        <p role="alert" className="mb-5 text-sm text-bo-danger">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[18px] border border-bo-border bg-bo-surface p-5"
      >
        <label className="flex flex-col gap-1 text-sm text-bo-muted">
          Contraseña actual
          <input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-bo-muted">
          Nueva contraseña
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-bo-muted">
          Confirmar nueva contraseña
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {saving ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
