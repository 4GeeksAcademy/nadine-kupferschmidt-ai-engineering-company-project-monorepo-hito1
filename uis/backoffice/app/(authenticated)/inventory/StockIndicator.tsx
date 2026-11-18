import type { StockLevel } from "./constants";

// Texto visible de cada nivel y su descripción para la leyenda.
export const LEVEL_LEGEND: { level: StockLevel; label: string; description: string }[] = [
  { level: "low", label: "Bajo", description: "reponer cuanto antes" },
  { level: "warning", label: "Atención", description: "conviene reponer pronto" },
  { level: "healthy", label: "Bien", description: "stock suficiente" },
];

// Color del círculo de cada nivel.
export const LEVEL_DOT_CLASSES: Record<StockLevel, string> = {
  low: "bg-[#E5484D]",
  warning: "bg-[#F5A524]",
  healthy: "bg-bo-switch-on",
};

const SR_LABELS: Record<StockLevel, string> = {
  low: "Nivel bajo",
  warning: "Nivel de atención",
  healthy: "Nivel bien",
};

type StockIndicatorProps = {
  level: StockLevel;
};

// Círculo de color con el nivel de stock; el texto queda para lectores de pantalla y el tooltip.
export default function StockIndicator({ level }: StockIndicatorProps) {
  const { label } = LEVEL_LEGEND.find((item) => item.level === level) ?? { label: "" };
  return (
    <span title={label} className="inline-flex items-center">
      <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${LEVEL_DOT_CLASSES[level]}`} />
      <span className="sr-only">{SR_LABELS[level]}</span>
    </span>
  );
}
