"use client";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-beige bg-white">
      <div className="mx-auto max-w-5xl px-6 py-6 flex flex-wrap items-center justify-between gap-2 text-sm text-brand-warmgray">
        <div>
          <p>
            <span className="font-serif font-semibold text-brand-ochre">Brasaland</span> &middot; People &amp; Talent
          </p>
          <p className="mt-1 text-xs">&iquest;Alg&uacute;n problema con la herramienta? Contacta a Brasaland Digital.</p>
        </div>
        <div className="flex items-center gap-4">
          <p>Herramienta interna &middot; &copy; 2026</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded border border-brand-beige bg-white px-3 py-1 text-xs text-brand-darkbrown hover:border-brand-ochre"
          >
            &uarr; Volver arriba
          </button>
        </div>
      </div>
    </footer>
  );
}