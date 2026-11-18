"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listInventoryOrders } from "@/lib/inventory";
import type { InventoryOrder } from "@/types/inventory";
import {
  EXIT_REASON_LABELS,
  ORDER_TYPE_LABELS,
  UNIT_LABELS,
  formatLocation,
} from "../constants";

const DEFAULT_ERROR_MESSAGE = "No se pudo cargar el historial.";

const SECONDARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-bo-border bg-bo-surface px-4 text-sm text-bo-text hover:bg-bo-stripe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text";

const ORDER_TYPE_DOT_CLASSES: Record<InventoryOrder["order_type"], string> = {
  inbound: "bg-bo-switch-on",
  outbound: "bg-[#E5484D]",
};

function formatDetail(order: InventoryOrder): string {
  if (order.order_type === "inbound") {
    return `Proveedor: ${order.supplier_name ?? "No registrado"}`;
  }
  return `Motivo: ${order.reason ? EXIT_REASON_LABELS[order.reason] : "No registrado"}`;
}

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<InventoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const results = await listInventoryOrders();
        if (active) setOrders(results);
      } catch (cause) {
        if (active) {
          setOrders([]);
          setError(cause instanceof Error ? cause.message : DEFAULT_ERROR_MESSAGE);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrders();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-bo-text">Historial de órdenes</h1>
        <p className="mt-1 text-sm text-bo-muted">
          Todas las entradas y salidas de ingredientes, de la más reciente a la más antigua.
        </p>
      </header>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <Link href="/inventory/orders/inbound" className={SECONDARY_BUTTON_CLASS}>
          Registrar entrada
        </Link>
        <Link href="/inventory/orders/outbound" className={SECONDARY_BUTTON_CLASS}>
          Registrar salida
        </Link>
      </div>

      <section
        aria-label="Historial de órdenes"
        aria-busy={loading}
        className="overflow-hidden rounded-[20px] border border-bo-border bg-bo-surface"
      >
        {error ? (
          <div className="flex flex-col items-start gap-4 p-6">
            <p role="alert" className="text-sm text-bo-danger">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="min-h-11 rounded-full bg-bo-accent px-5 text-sm font-medium text-bo-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bo-text"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : loading ? (
          <p role="status" className="p-6 text-sm text-bo-muted">
            Cargando historial…
          </p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-bo-muted">Todavía no hay órdenes registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-bo-page text-xs font-medium text-bo-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                  <th scope="col" className="px-4 py-3 font-medium">Tipo</th>
                  <th scope="col" className="px-4 py-3 font-medium">Ingrediente</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Cantidad</th>
                  <th scope="col" className="px-4 py-3 font-medium">Detalle</th>
                  <th scope="col" className="px-4 py-3 font-medium">Local</th>
                  <th scope="col" className="px-4 py-3 font-medium">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  // \u2212 es el signo menos, del mismo ancho que "+", para que los números queden alineados.
                  const sign = order.order_type === "inbound" ? "+" : "\u2212";
                  const amountClass = order.order_type === "inbound" ? "text-bo-success" : "text-bo-danger";
                  const unitLabel =
                    order.quantity === 1
                      ? UNIT_LABELS[order.unit].singular
                      : UNIT_LABELS[order.unit].plural;
                  return (
                    <tr
                      key={`${order.order_type}-${order.id}`}
                      className={index % 2 === 1 ? "bg-bo-stripe" : "bg-bo-surface"}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-bo-text">
                        {new Date(order.created_at).toLocaleString("es", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${ORDER_TYPE_DOT_CLASSES[order.order_type]}`}
                          />
                          <span className="text-bo-text">{ORDER_TYPE_LABELS[order.order_type]}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="font-medium text-bo-text">{order.ingredient_name}</div>
                        <div className="text-xs text-bo-muted">{order.ingredient_sku}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                        <span className={amountClass}>
                          {sign}
                          {order.quantity.toLocaleString("es", { maximumFractionDigits: 2 })} {unitLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-bo-text">{formatDetail(order)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-bo-text">{formatLocation(order.location_id)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-bo-muted">{order.user_uuid}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
