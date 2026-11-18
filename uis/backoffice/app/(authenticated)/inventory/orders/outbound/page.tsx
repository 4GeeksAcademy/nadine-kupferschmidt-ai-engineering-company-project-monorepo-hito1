import Link from "next/link";
import { Suspense } from "react";
import OutboundOrderForm from "./OutboundOrderForm";

export default function RegistrarSalidaPage() {
  return (
    <div>
      <Link
        href="/inventory/products"
        className="mb-3 inline-block text-sm text-bo-muted underline-offset-2 hover:underline"
      >
        Volver al inventario
      </Link>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-bo-text">Registrar salida</h1>
        <p className="mt-1 text-sm text-bo-muted">
          Consumo o merma de ingredientes en un local.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-bo-muted">Cargando formulario…</p>}>
        <OutboundOrderForm />
      </Suspense>
    </div>
  );
}
