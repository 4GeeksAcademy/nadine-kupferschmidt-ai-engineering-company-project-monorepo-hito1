"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  text: string;
  icon: ReactNode;
};

export default function NavLink({ href, text, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 items-center gap-2.5 rounded-[10px] px-3 text-sm no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text ${
        isActive
          ? "bg-bo-tabs font-medium text-bo-text"
          : "text-bo-menu hover:bg-bo-stripe"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}
