// Prueba de nivel (docs/PLAN.md F17). Lógica pura: qué unidad recomendar según las respuestas.
import type { Level } from "@/content/schema";

/** Una pregunta de la prueba: la unidad que mide y si se acertó */
export type Outcome = { unit: string; correct: boolean };

/** Por unidad evaluada, en el orden del curso: bien solo si acertó todas sus preguntas */
export function unitResults(
  outcomes: readonly Outcome[],
  order: readonly string[],
): { unit: string; ok: boolean }[] {
  return order.flatMap((unit) => {
    const own = outcomes.filter((o) => o.unit === unit);
    return own.length ? [{ unit, ok: own.every((o) => o.correct) }] : [];
  });
}

/**
 * Unidad por la que empezar: la primera fallada que no parece un despiste, es decir, con
 * otro fallo en una de las dos unidades evaluadas siguientes (o que es la última). Un fallo
 * suelto entre aciertos no manda atrás a quien ya sabe más. Si no hay ninguna, la última.
 */
export function recommendedFromTest(
  outcomes: readonly Outcome[],
  order: readonly string[],
): string | undefined {
  const results = unitResults(outcomes, order);
  const frontier = results.find(
    (r, i) =>
      !r.ok &&
      (i === results.length - 1 || results[i + 1]?.ok === false || results[i + 2]?.ok === false),
  );
  return frontier?.unit ?? results.at(-1)?.unit;
}

const LEVELS: readonly Level[] = ["A1", "A2", "B1", "B2", "C1"];

/** Aciertos por nivel, del más fácil al más difícil, para el resultado */
export function levelScores(
  outcomes: readonly Outcome[],
  levelOf: (unit: string) => Level | undefined,
): { level: Level; correct: number; total: number }[] {
  return LEVELS.flatMap((level) => {
    const own = outcomes.filter((o) => levelOf(o.unit) === level);
    return own.length
      ? [{ level, correct: own.filter((o) => o.correct).length, total: own.length }]
      : [];
  });
}
