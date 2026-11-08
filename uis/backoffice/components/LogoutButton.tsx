"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleLogout}
      className="flex min-h-11 w-full items-center rounded-[10px] px-3 text-left text-sm text-bo-menu hover:bg-bo-stripe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
    >
      Cerrar sesión
    </button>
  );
}
