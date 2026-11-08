import Link from "next/link";
import NavLink from "../../components/NavLink";
import AuthGuard from "../../components/AuthGuard";
import UserMenu from "../../components/UserMenu";

const iconProps = {
  "aria-hidden": true,
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "shrink-0",
} as const;

const alertIcon = (
  <svg {...iconProps}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const truckIcon = (
  <svg {...iconProps}>
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen md:flex">
        <aside className="border-b border-bo-border bg-bo-surface md:sticky md:top-0 md:flex md:h-screen md:w-[220px] md:shrink-0 md:flex-col md:border-r md:border-b-0">
          <div className="flex items-center justify-between border-b border-bo-border pr-5 md:block md:pr-0">
            <Link href="/" aria-label="Brasaland, inicio" className="flex flex-col items-start gap-1 px-5 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text">
              <span className="font-serif text-xl font-semibold tracking-wide text-bo-logo">Brasaland</span>
              <span className="text-sm text-bo-muted">Backoffice interno</span>
            </Link>
            <div className="md:hidden">
              <UserMenu />
            </div>
          </div>
          <nav aria-label="Menú principal" className="px-3 py-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-bo-muted">Menú</p>
            <div className="space-y-1">
              <NavLink href="/incidencias" text="Incidencias" icon={alertIcon} />
              <NavLink href="/suppliers" text="Proveedores" icon={truckIcon} />
            </div>
          </nav>
          <p className="hidden px-5 pb-6 text-xs text-bo-muted md:mt-auto md:block">Brasaland Digital · Uso interno</p>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="hidden items-center justify-end border-b border-bo-border bg-bo-surface px-5 py-2 sm:px-8 md:flex lg:px-12">
            <UserMenu />
          </header>
          <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
