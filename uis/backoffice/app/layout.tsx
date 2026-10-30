import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brasaland Backoffice",
  description: "Análisis interno de incidencias operativas de Brasaland.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 font-sans text-brand-charcoal antialiased selection:bg-brand-ochre/30">
        <div className="min-h-screen md:flex">
          <aside className="border-b border-brand-beige bg-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
            <Link href="/" aria-label="Brasaland, inicio" className="flex flex-col items-start gap-1 border-b border-brand-beige p-6 focus-visible:outline-2 focus-visible:outline-brand-darkbrown">
              <span className="font-serif text-xl font-semibold text-brand-ochre">Brasaland</span>
              <span className="text-sm text-brand-warmgray">Operaciones</span>
            </Link>
            <nav aria-label="Menú principal" className="px-4 pb-5 md:pt-6">
              <p className="mb-3 px-3 pt-5 text-sm font-semibold uppercase text-brand-warmgray md:pt-0">Backoffice</p>
              <Link href="/incidencias" className="block rounded border-l-2 border-brand-ochre bg-gray-50 px-3 py-3 text-sm text-brand-darkbrown underline hover:text-brand-ochre focus-visible:outline-2 focus-visible:outline-brand-darkbrown">Análisis de incidencias</Link>
            </nav>
            <p className="hidden px-7 text-xs text-brand-warmgray md:absolute md:bottom-7 md:block">Brasaland Digital · Uso interno</p>
          </aside>
          <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
