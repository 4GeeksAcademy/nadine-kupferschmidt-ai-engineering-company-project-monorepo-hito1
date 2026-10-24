import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-brand-beige">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <Link
            href="/"
            className="font-serif text-xl font-semibold tracking-wide text-brand-ochre"
          >
            Brasaland
          </Link>
          <span className="text-sm text-brand-warmgray">People &amp; Talent</span>
        </div>
        <nav className="flex gap-5 text-sm items-center">
          <Link href="/" className="text-brand-warmgray hover:text-brand-ochre flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            Candidaturas
          </Link>
          <Link href="/candidates/new" className="flex items-center gap-1.5 rounded bg-brand-ochre px-3 py-1.5 text-brand-darkbrown hover:opacity-90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva candidatura
          </Link>
        </nav>
      </div>
    </header>
  );
}