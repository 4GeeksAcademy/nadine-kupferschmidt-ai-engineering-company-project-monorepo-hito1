import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type Status,
  type Supplier,
} from "./types";

type SupplierTableProps = {
  suppliers: Supplier[];
};

const statusClass: Record<Status, string> = {
  active: "border-green-600 text-green-700",
  suspended: "border-red-600 text-red-700",
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatRate(supplier: Supplier): string {
  const decimals = supplier.currency === "COP" ? 0 : 2;
  const amount = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(supplier.rate_per_unit);

  return `${amount} ${supplier.currency}`;
}

// Presenta los proveedores con etiquetas y formatos locales.
export default function SupplierTable({ suppliers }: SupplierTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-brand-beige bg-white">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-gray-200 text-brand-darkbrown">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
            <th scope="col" className="px-4 py-3 font-semibold">País</th>
            <th scope="col" className="px-4 py-3 font-semibold">Categorías</th>
            <th scope="col" className="px-4 py-3 font-semibold">Tarifa por unidad</th>
            <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
            <th scope="col" className="px-4 py-3 font-semibold">Última actualización de tarifa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-beige">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-brand-ivory">
              <td className="px-4 py-3 font-medium text-brand-darkbrown">
                {supplier.name}
              </td>
              <td className="px-4 py-3 text-brand-charcoal">
                {supplier.country === "USA" ? "Estados Unidos" : supplier.country}
              </td>
              <td className="px-4 py-3 text-brand-charcoal">
                {supplier.categories
                  .map((category) => CATEGORY_LABELS[category])
                  .join(", ")}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-brand-charcoal">
                {formatRate(supplier)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2 py-0 text-xs font-medium ${statusClass[supplier.status]}`}
                >
                  {STATUS_LABELS[supplier.status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-brand-warmgray">
                {dateFormatter.format(new Date(supplier.updated_at))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
