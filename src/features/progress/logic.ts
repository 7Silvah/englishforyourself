// Lógica pura del progreso (docs/PLAN.md §7.6). El store solo la llama y guarda el resultado.

export type Attempt = {
  best: number; // mejor nota, en %
  last: number; // nota del último intento, en %
  count: number;
  at: string; // ISO
};

export type Mistake = {
  setId: string;
  itemId: string;
  count: number; // veces fallado
  at: string; // último fallo (ISO)
  rightDays: string[]; // días distintos en que se acertó después de fallarlo
};

/** Aciertos en días distintos para que un ítem salga de "Repasar mis errores" */
export const REVIEW_EXIT_DAYS = 2;

export type Streak = { days: number; lastDay: string }; // lastDay: "2026-10-30"

export type ProgressData = {
  attempts: Record<string, Attempt>; // por id de set
  mistakes: Record<string, Mistake>; // por mistakeKey()
  streak: Streak | null;
  lastSetId: string | null; // para "Continúa donde lo dejaste"
};

export type ItemOutcome = { itemId: string; correct: boolean };

export const initialProgress: ProgressData = {
  attempts: {},
  mistakes: {},
  streak: null,
  lastSetId: null,
};

export function mistakeKey(setId: string, itemId: string): string {
  return `${setId}#${itemId}`;
}

export function percent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((100 * correct) / total);
}

/** Día local en formato AAAA-MM-DD (la racha cuenta días del calendario del estudiante) */
export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function previousDay(day: string): string {
  const [y = 0, m = 1, d = 1] = day.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}

/** Practicar hoy mantiene la racha; ayer la alarga; si hubo un hueco, vuelve a 1 */
export function nextStreak(streak: Streak | null, today: string): Streak {
  if (!streak) return { days: 1, lastDay: today };
  if (streak.lastDay === today) return streak;
  if (streak.lastDay === previousDay(today)) return { days: streak.days + 1, lastDay: today };
  return { days: 1, lastDay: today };
}

/**
 * Guarda el resultado de una ronda. Si la ronda no tenía todos los ítems del set
 * (repetir solo los fallados), no cuenta como intento: solo actualiza los errores.
 */
export function applyResults(
  data: ProgressData,
  setId: string,
  outcomes: readonly ItemOutcome[],
  { complete, now }: { complete: boolean; now: Date },
): ProgressData {
  const mistakes = updateMistakes(
    data.mistakes,
    outcomes.map((o) => ({ ...o, setId })),
    now,
  );

  const attempts = { ...data.attempts };
  if (complete && outcomes.length > 0) {
    const score = percent(outcomes.filter((o) => o.correct).length, outcomes.length);
    const prev = attempts[setId];
    attempts[setId] = {
      best: Math.max(prev?.best ?? 0, score),
      last: score,
      count: (prev?.count ?? 0) + 1,
      at: now.toISOString(),
    };
  }

  return {
    attempts,
    mistakes,
    streak: nextStreak(data.streak, dayKey(now)),
    lastSetId: setId,
  };
}

export type ReviewOutcome = { setId: string; itemId: string; correct: boolean };

/**
 * Actualiza la lista de errores:
 * - fallar un ítem lo añade (o lo vuelve a poner a cero de aciertos);
 * - acertar un ítem de la lista suma el día; con REVIEW_EXIT_DAYS días distintos, sale.
 */
export function updateMistakes(
  mistakes: Readonly<Record<string, Mistake>>,
  outcomes: readonly ReviewOutcome[],
  now: Date,
): Record<string, Mistake> {
  const next = { ...mistakes };
  const day = dayKey(now);
  for (const { setId, itemId, correct } of outcomes) {
    const key = mistakeKey(setId, itemId);
    const prev = next[key];
    if (!correct) {
      next[key] = {
        setId,
        itemId,
        count: (prev?.count ?? 0) + 1,
        at: now.toISOString(),
        rightDays: [],
      };
      continue;
    }
    if (!prev) continue;
    const rightDays = prev.rightDays.includes(day) ? prev.rightDays : [...prev.rightDays, day];
    if (rightDays.length >= REVIEW_EXIT_DAYS) delete next[key];
    else next[key] = { ...prev, rightDays };
  }
  return next;
}

/** Resultado de un repaso (errores o mixto): ítems de varios sets a la vez. No es un intento de ningún set. */
export function applyReview(
  data: ProgressData,
  outcomes: readonly ReviewOutcome[],
  now: Date,
): ProgressData {
  return {
    ...data,
    mistakes: updateMistakes(data.mistakes, outcomes, now),
    streak: nextStreak(data.streak, dayKey(now)),
  };
}

// ---------- Datos guardados (localStorage) ----------

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Convierte lo guardado por una versión anterior de la app a la forma actual.
 * Los datos de localStorage son externos: se comprueban campo a campo y lo que no
 * tenga sentido se descarta, en lugar de confiar en ellos.
 * - v1 → v2: los errores ganan "rightDays" (empiezan sin aciertos).
 */
export function migrateProgress(persisted: unknown, version: number): ProgressData {
  if (!isRecord(persisted)) return initialProgress;
  const mistakes: Record<string, Mistake> = {};
  if (isRecord(persisted.mistakes))
    for (const [key, value] of Object.entries(persisted.mistakes)) {
      if (!isRecord(value)) continue;
      const { setId, itemId, count, at, rightDays } = value;
      if (typeof setId !== "string" || typeof itemId !== "string") continue;
      mistakes[key] = {
        setId,
        itemId,
        count: typeof count === "number" ? count : 1,
        at: typeof at === "string" ? at : new Date(0).toISOString(),
        rightDays:
          version >= 2 && Array.isArray(rightDays)
            ? rightDays.filter((d): d is string => typeof d === "string")
            : [],
      };
    }

  const attempts: Record<string, Attempt> = {};
  if (isRecord(persisted.attempts))
    for (const [id, value] of Object.entries(persisted.attempts)) {
      if (!isRecord(value)) continue;
      const { best, last, count, at } = value;
      if (typeof best !== "number" || typeof last !== "number") continue;
      attempts[id] = {
        best,
        last,
        count: typeof count === "number" ? count : 1,
        at: typeof at === "string" ? at : new Date(0).toISOString(),
      };
    }

  const streak = isRecord(persisted.streak) ? persisted.streak : null;
  return {
    attempts,
    mistakes,
    streak:
      streak && typeof streak.days === "number" && typeof streak.lastDay === "string"
        ? { days: streak.days, lastDay: streak.lastDay }
        : null,
    lastSetId: typeof persisted.lastSetId === "string" ? persisted.lastSetId : null,
  };
}
