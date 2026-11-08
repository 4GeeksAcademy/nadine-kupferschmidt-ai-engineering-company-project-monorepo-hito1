"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import LogoutButton from "./LogoutButton";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    apiFetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.email) setEmail(data.email);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Menú de usuario"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-bo-border bg-bo-surface text-bo-menu hover:bg-bo-stripe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
      >
        <svg
          aria-hidden="true"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menú de usuario"
          onClick={() => setOpen(false)}
          className="absolute right-0 z-10 mt-2 w-64 rounded-[18px] border border-bo-border bg-bo-surface p-2"
        >
          <p className="truncate border-b border-bo-border px-3 py-2 text-sm text-bo-muted">
            {email ?? "…"}
          </p>
          <div className="mt-2 space-y-1">
            <Link
              href="/account/profile"
              role="menuitem"
              className="flex min-h-11 items-center rounded-[10px] px-3 text-sm text-bo-menu no-underline hover:bg-bo-stripe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
            >
              Mi perfil
            </Link>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
