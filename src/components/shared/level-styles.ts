// Colores de cada nivel del MCER (tokens level-a1 … level-c1 de index.css; regla de U2,
// ver /dev/ui). Clases completas: Tailwind solo genera las que aparecen escritas tal cual.
import type { Level } from "@/content/schema";

/** Fondo suave, borde y texto del nivel: para insignias y acentos (el círculo de una unidad) */
export const LEVEL_TONE: Record<Level, string> = {
  A1: "border-level-a1-border bg-level-a1 text-level-a1-fg",
  A2: "border-level-a2-border bg-level-a2 text-level-a2-fg",
  B1: "border-level-b1-border bg-level-b1 text-level-b1-fg",
  B2: "border-level-b2-border bg-level-b2 text-level-b2-fg",
  C1: "border-level-c1-border bg-level-c1 text-level-c1-fg",
};
