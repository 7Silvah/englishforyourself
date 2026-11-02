import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Control segmentado: una etiqueta y sus opciones en una cápsula (regla de U2, ver /dev/ui).
// Las opciones son enlaces o botones de cada pantalla con la clase segmentedItem().
export function Segmented({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-0.5 rounded-lg border bg-background p-0.5">{children}</div>
    </div>
  );
}
