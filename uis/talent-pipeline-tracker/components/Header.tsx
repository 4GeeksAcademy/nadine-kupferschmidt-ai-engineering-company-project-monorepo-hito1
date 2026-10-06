import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-brand-beige">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-baseline gap-3">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-wide text-brand-ochre"
        >
          Brasaland
        </Link>
        <span className="text-sm text-brand-warmgray">People &amp; Talent</span>
      </div>
    </header>
  );
}