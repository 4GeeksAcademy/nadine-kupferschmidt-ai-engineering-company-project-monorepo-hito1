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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="bg-bo-page text-xs font-medium text-bo-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Proveedor</th>
            <th scope="col" className="px-4 py-3 font-medium">País</th>
            <th scope="col" className="px-4 py-3 font-medium">Categorías</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Tarifa por unidad</th>
            <th scope="col" className="px-4 py-3 font-medium">Estado</th>
            <th scope="col" className="px-4 py-3 font-medium">Última actualización de tarifa</th>
            <th scope="col" className="w-14 px-2 py-3">
              <span className="sr-only">Eliminar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier, index) => (
            <SupplierRow
              key={supplier.id}
              supplier={supplier}
              striped={index % 2 === 1}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
