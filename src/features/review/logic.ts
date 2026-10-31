// Repaso inteligente (F12): qué ítems entran en "Repasar mis errores" y en el repaso mixto.
// Lógica pura: recibe los errores, las notas y los sets ya cargados.
import type { UnitMeta } from "@/content/schema";
import { unitSequence, unitStatus } from "@/features/course/logic";
import type { ExerciseItem, ExerciseSet } from "@/features/exercises/schema";
import type { Attempt, Mistake, ReviewOutcome } from "@/features/progress/logic";
import { seededShuffle } from "@/lib/random";

export const REVIEW_LIMIT = 20; // ítems por ronda de errores
export const MIXED_COUNT = 15; // ítems por repaso mixto

/** Errores pendientes: primero los que llevan más tiempo esperando */
export function pendingMistakes(mistakes: Readonly<Record<string, Mistake>>): Mistake[] {
  return Object.values(mistakes).sort((a, b) => a.at.localeCompare(b.at));
}

// En una sesión de repaso se mezclan ítems de varios sets: el id lleva el set delante
const SEPARATOR = "#";

function withSource(setId: string, item: ExerciseItem): ExerciseItem {
  return { ...item, id: `${setId}${SEPARATOR}${item.id}` };
}

/** De "set#ítem" (id en la sesión) a su set y su ítem originales */
export function sourceOf(sessionItemId: string): { setId: string; itemId: string } {
  const at = sessionItemId.indexOf(SEPARATOR);
  return { setId: sessionItemId.slice(0, at), itemId: sessionItemId.slice(at + 1) };
}

/** Ítems de una ronda de errores. Los que ya no existen (set o ítem borrado) se ignoran. */
export function mistakeItems(
  mistakes: readonly Mistake[],
  sets: ReadonlyMap<string, ExerciseSet>,
  limit = REVIEW_LIMIT,
): ExerciseItem[] {
  return mistakes
    .flatMap((m) => {
      const item = sets.get(m.setId)?.items.find((i) => i.id === m.itemId);
      return item ? [withSource(m.setId, item)] : [];
    })
    .slice(0, limit);
}

/** Ítems al azar de varios sets (repaso mixto) */
export function mixedItems(
  sets: ReadonlyMap<string, ExerciseSet>,
  seed: string,
  count = MIXED_COUNT,
): ExerciseItem[] {
  const all = [...sets].flatMap(([setId, set]) => set.items.map((item) => withSource(setId, item)));
  return seededShuffle(all, seed).slice(0, count);
}

type UnitLike = { meta: UnitMeta };

/** Unidades dominadas (repaso con ≥ 80 %) */
export function masteredUnits<T extends UnitLike>(
  units: readonly T[],
  attempts: Readonly<Record<string, Attempt>>,
): T[] {
  return units.filter((u) => unitStatus(u.meta, attempts) === "mastered");
}

/** Sets de los que sale el repaso mixto: todos los de las unidades dominadas */
export function mixedSetIds(units: readonly UnitLike[]): string[] {
  return [...new Set(units.flatMap((u) => unitSequence(u.meta)))];
}

/** Resultado de la sesión (ids "set#ítem") → resultados por set e ítem originales */
export function reviewOutcomes(
  records: readonly { item: { id: string }; correct: boolean }[],
): ReviewOutcome[] {
  return records.map(({ item, correct }) => ({ ...sourceOf(item.id), correct }));
}
