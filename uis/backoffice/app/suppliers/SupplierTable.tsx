import SupplierRow from "./SupplierRow";
import type { Supplier } from "./types";

type SupplierTableProps = {
  suppliers: Supplier[];
  onUpdated: (supplier: Supplier) => void;
  onDeleted: (id: number) => void;
};

// Presenta los proveedores con etiquetas y formatos locales.
export default function SupplierTable({
  suppliers,
  onUpdated,
  onDeleted,
}: SupplierTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-brand-beige bg-white">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="bg-gray-200 text-brand-darkbrown">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
            <th scope="col" className="px-4 py-3 font-semibold">País</th>
            <th scope="col" className="px-4 py-3 font-semibold">Categorías</th>
            <th scope="col" className="px-4 py-3 font-semibold">Tarifa por unidad</th>
            <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
            <th scope="col" className="px-4 py-3 font-semibold">Última actualización de tarifa</th>
            <th scope="col" className="px-4 py-3 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-beige">
          {suppliers.map((supplier) => (
            <SupplierRow
              key={supplier.id}
              supplier={supplier}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
