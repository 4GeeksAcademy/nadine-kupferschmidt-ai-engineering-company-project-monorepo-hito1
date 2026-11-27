import type { ReactNode } from "react";

type BrandLogoProps = {
  as?: "p" | "span";
  className?: string;
};

export default function BrandLogo({
  as: Component = "p",
  className = "",
}: BrandLogoProps): ReactNode {
  const baseClasses = "font-serif text-xl font-bold tracking-wide text-bo-logo";
  const finalClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return <Component className={finalClasses}>Brasaland</Component>;
}
