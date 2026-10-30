// Lógica pura del progreso (docs/PLAN.md §7.6). El store solo la llama y guarda el resultado.

export type Attempt = {
  best: number; // mejor nota, en %
  last: number; // nota del último intento, en %
  count: number;
  at: string; // ISO
};

export type Mistake = { setId: string; itemId: string; count: number; at: string };

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
  const at = now.toISOString();
  const mistakes = { ...data.mistakes };
  for (const { itemId, correct } of outcomes) {
    if (correct) continue;
    const key = mistakeKey(setId, itemId);
    mistakes[key] = { setId, itemId, count: (mistakes[key]?.count ?? 0) + 1, at };
  }

  const attempts = { ...data.attempts };
  if (complete && outcomes.length > 0) {
    const score = percent(outcomes.filter((o) => o.correct).length, outcomes.length);
    const prev = attempts[setId];
    attempts[setId] = {
      best: Math.max(prev?.best ?? 0, score),
      last: score,
      count: (prev?.count ?? 0) + 1,
      at,
    };
  }

  return {
    attempts,
    mistakes,
    streak: nextStreak(data.streak, dayKey(now)),
    lastSetId: setId,
  };
}
