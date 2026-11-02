import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Tarjeta de sección (regla de U2, ver /dev/ui): borde fino y esquinas amplias, con una
// cabecera opcional sobre fondo suave y un pie opcional separado por una línea. El cuerpo
// no lleva relleno: cada pantalla pone el suyo (una tabla va de borde a borde).
export function SectionCard({
  header,
  footer,
  children,
  className,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      {header && <div className="border-b bg-muted/50 px-4 py-3 md:px-6">{header}</div>}
      {children}
      {footer && <div className="border-t px-4 py-4 md:px-6">{footer}</div>}
    </section>
  );
}
