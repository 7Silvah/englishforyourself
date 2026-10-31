// Flashcards con el sistema Leitner (docs/PLAN.md F13). Lógica pura, sin estado.
//
// Cada tarjeta está en una caja del 1 al 5. Si la sabes, sube de caja y tarda más en
// volver; si no la sabes, vuelve a la caja 1 y se repite pronto. Así repasas más lo
// que te cuesta y menos lo que ya dominas (repetición espaciada).
import { dayKey } from "@/features/progress/logic";
import { seededShuffle } from "@/lib/random";

export type CardState = { box: number; due: string }; // due: día "2026-10-30" en que toca repasarla

export type Card = { key: string; en: string; es: string };

/** Días que espera una tarjeta según su caja (la caja 1 vuelve el mismo día) */
export const BOX_INTERVALS = [0, 1, 3, 7, 14] as const;
export const MAX_BOX = BOX_INTERVALS.length;

export const NEW_PER_SESSION = 10; // tarjetas nuevas por sesión
export const SESSION_SIZE = 20; // tarjetas por sesión como máximo

/** Clave de una palabra: su lista y la palabra en inglés */
export function cardKey(listPath: string, en: string): string {
  return `${listPath}#${en}`;
}

function addDays(day: string, days: number): string {
  const [y = 0, m = 1, d = 1] = day.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

/**
 * Nueva caja y fecha tras responder. Una tarjeta nueva que ya sabías empieza en la caja 2
 * (vuelve mañana): no tiene sentido repetir hoy lo que acabas de demostrar que sabes.
 */
export function review(state: CardState | undefined, knew: boolean, today: string): CardState {
  const box = !knew ? 1 : state ? Math.min(state.box + 1, MAX_BOX) : 2;
  return { box, due: addDays(today, BOX_INTERVALS[box - 1] ?? 0) };
}

/**
 * Tarjetas de una sesión: primero las que toca repasar hoy (las de caja más baja antes),
 * después algunas nuevas. Barajadas con semilla dentro de cada grupo.
 */
export function buildSession(
  cards: readonly Card[],
  states: Readonly<Record<string, CardState>>,
  today: string,
  seed: string,
): Card[] {
  const due = cards
    .filter((c) => {
      const s = states[c.key];
      return s !== undefined && s.due <= today;
    })
    .sort((a, b) => (states[a.key]?.box ?? 0) - (states[b.key]?.box ?? 0));
  const fresh = seededShuffle(
    cards.filter((c) => states[c.key] === undefined),
    seed,
  ).slice(0, NEW_PER_SESSION);
  return [...seededShuffle(due, `${seed}:due`), ...fresh].slice(0, SESSION_SIZE);
}

/** Resumen de una lista: cuántas tocan hoy, cuántas son nuevas y cuántas dominadas (caja 5) */
export function deckStats(
  keys: readonly string[],
  states: Readonly<Record<string, CardState>>,
  today: string,
) {
  let due = 0;
  let fresh = 0;
  let mastered = 0;
  for (const key of keys) {
    const s = states[key];
    if (!s) fresh++;
    else {
      if (s.due <= today) due++;
      if (s.box === MAX_BOX) mastered++;
    }
  }
  return { due, fresh, mastered };
}

/** Estadísticas de una lista sin cargar sus palabras: solo con las tarjetas ya vistas */
export function seenStats(
  listPath: string,
  total: number,
  states: Readonly<Record<string, CardState>>,
  today: string,
) {
  const prefix = `${listPath}#`;
  const seen = Object.entries(states).filter(([key]) => key.startsWith(prefix));
  return {
    due: seen.filter(([, s]) => s.due <= today).length,
    fresh: Math.max(total - seen.length, 0),
    mastered: seen.filter(([, s]) => s.box === MAX_BOX).length,
  };
}
