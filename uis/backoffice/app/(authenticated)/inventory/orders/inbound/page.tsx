import Link from "next/link";
import { Suspense } from "react";
import InboundOrderForm from "./InboundOrderForm";

export default function RegistrarEntradaPage() {
  return (
    <div>
      <Link
        href="/inventory/products"
        className="mb-3 inline-block text-sm text-bo-muted underline-offset-2 hover:underline"
      >
        Volver al inventario
      </Link>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-bo-text">Registrar entrada</h1>
        <p className="mt-1 text-sm text-bo-muted">
          Entrega de ingredientes recibida de un proveedor.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-bo-muted">Cargando formulario…</p>}>
        <InboundOrderForm />
      </Suspense>
    </div>
  );
}
