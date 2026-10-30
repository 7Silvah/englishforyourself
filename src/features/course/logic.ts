// Estado de las unidades del curso. No se guarda: se calcula a partir de las notas
// de los sets (store de progreso), así no hay dos fuentes que mantener sincronizadas.
import type { UnitMeta } from "@/content/schema";
import type { Attempt } from "@/features/progress/logic";

export type UnitStatus = "new" | "started" | "completed" | "mastered";

/** Nota mínima del repaso para dar la unidad por dominada */
export const MASTERY = 80;

type UnitSets = Pick<UnitMeta, "guided" | "free" | "worksheets" | "review">;

/** Todos los sets de la unidad, en el orden de la plantilla (§6.2) */
export function unitSequence(meta: UnitSets): string[] {
  return [
    ...(meta.guided ?? []),
    ...(meta.free ?? []),
    ...(meta.worksheets ?? []),
    ...(meta.review ? [meta.review] : []),
  ];
}

/**
 * - dominada: el repaso tiene ≥ 80 %
 * - completada: hiciste la práctica y el repaso (el worksheet es opcional)
 * - empezada: hiciste algún set
 */
export function unitStatus(meta: UnitSets, attempts: Record<string, Attempt>): UnitStatus {
  if (meta.review && (attempts[meta.review]?.best ?? 0) >= MASTERY) return "mastered";
  const required = [
    ...(meta.guided ?? []),
    ...(meta.free ?? []),
    ...(meta.review ? [meta.review] : []),
  ];
  if (required.length > 0 && required.every((id) => attempts[id])) return "completed";
  return unitSequence(meta).some((id) => attempts[id]) ? "started" : "new";
}

/** La unidad recomendada es la primera que aún no dominas. El curso no bloquea ninguna. */
export function recommendedUnit<T extends { meta: UnitSets }>(
  units: readonly T[],
  attempts: Record<string, Attempt>,
): T | undefined {
  return units.find((u) => unitStatus(u.meta, attempts) !== "mastered");
}
