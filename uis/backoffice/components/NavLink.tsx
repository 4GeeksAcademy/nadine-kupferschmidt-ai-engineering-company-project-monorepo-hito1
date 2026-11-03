"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  text: string;
};

export default function NavLink({ href, text }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`block rounded border-l-2 px-3 py-3 text-sm text-brand-darkbrown underline hover:text-brand-ochre focus-visible:outline-2 focus-visible:outline-brand-darkbrown ${
        isActive ? "border-brand-ochre bg-gray-50" : "border-transparent"
      }`}
    >
      {text}
    </Link>
  );
}
