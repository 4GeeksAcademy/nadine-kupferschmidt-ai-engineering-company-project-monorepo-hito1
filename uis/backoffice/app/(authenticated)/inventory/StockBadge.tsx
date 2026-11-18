import type { StockLevel } from "./constants";

type StockBadgeProps = {
  level: StockLevel;
};

// Texto y colores de cada nivel; el texto siempre se muestra, no solo el color.
const BADGE_STYLES: Record<StockLevel, { label: string; className: string }> = {
  low: {
    label: "Bajo",
    className: "border-transparent bg-bo-danger-soft text-bo-danger",
  },
  warning: {
    label: "Atención",
    className: "border-transparent bg-bo-accent-soft text-bo-on-accent-soft",
  },
  healthy: {
    label: "Bien",
    className: "border-bo-border bg-bo-surface text-bo-success",
  },
};

// Pastilla con el nivel de stock de un ingrediente.
export default function StockBadge({ level }: StockBadgeProps) {
  const { label, className } = BADGE_STYLES[level];
  return (
    <span className={`inline-block rounded-full border px-2 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
