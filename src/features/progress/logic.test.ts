import { describe, expect, it } from "vitest";
import { applyResults, dayKey, initialProgress, mistakeKey, nextStreak, percent } from "./logic";

describe("nextStreak", () => {
  it("empieza en 1", () => {
    expect(nextStreak(null, "2026-10-30")).toEqual({ days: 1, lastDay: "2026-10-30" });
  });

  it("no cambia si ya practicaste hoy", () => {
    const streak = { days: 3, lastDay: "2026-10-30" };
    expect(nextStreak(streak, "2026-10-30")).toBe(streak);
  });

  it("suma un día si practicaste ayer, también al cambiar de mes", () => {
    expect(nextStreak({ days: 3, lastDay: "2026-10-31" }, "2026-11-01")).toEqual({
      days: 4,
      lastDay: "2026-11-01",
    });
  });

  it("vuelve a 1 si te saltaste un día", () => {
    expect(nextStreak({ days: 5, lastDay: "2026-10-27" }, "2026-10-30").days).toBe(1);
  });
});

describe("applyResults", () => {
  const now = new Date(2026, 9, 30, 12);
  const outcomes = [
    { itemId: "1", correct: true },
    { itemId: "2", correct: false },
    { itemId: "3", correct: true },
    { itemId: "4", correct: true },
  ];

  it("guarda la nota, los fallos, la racha y el último set", () => {
    const data = applyResults(initialProgress, "simple-past", outcomes, { complete: true, now });
    expect(data.attempts["simple-past"]).toMatchObject({ best: 75, last: 75, count: 1 });
    expect(data.mistakes[mistakeKey("simple-past", "2")]).toMatchObject({ count: 1 });
    expect(data.streak).toEqual({ days: 1, lastDay: dayKey(now) });
    expect(data.lastSetId).toBe("simple-past");
  });

  it("conserva la mejor nota y cuenta los intentos", () => {
    const first = applyResults(initialProgress, "s", outcomes, { complete: true, now });
    const worse = outcomes.map((o) => ({ ...o, correct: false }));
    const second = applyResults(first, "s", worse, { complete: true, now });
    expect(second.attempts.s).toMatchObject({ best: 75, last: 0, count: 2 });
    expect(second.mistakes[mistakeKey("s", "2")]?.count).toBe(2);
  });

  it("repetir solo los fallados no cuenta como intento", () => {
    const data = applyResults(initialProgress, "s", [{ itemId: "2", correct: true }], {
      complete: false,
      now,
    });
    expect(data.attempts.s).toBeUndefined();
  });
});

it("percent redondea y no divide entre cero", () => {
  expect(percent(2, 3)).toBe(67);
  expect(percent(0, 0)).toBe(0);
});
