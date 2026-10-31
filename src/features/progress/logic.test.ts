import { describe, expect, it } from "vitest";
import {
  applyResults,
  applyReview,
  dayKey,
  initialProgress,
  migrateProgress,
  mistakeKey,
  nextStreak,
  percent,
  updateMistakes,
} from "./logic";

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

describe("updateMistakes (Repasar mis errores)", () => {
  const day1 = new Date(2026, 9, 30, 10);
  const day1Later = new Date(2026, 9, 30, 18);
  const day2 = new Date(2026, 9, 31, 9);
  const wrong = { setId: "s", itemId: "1", correct: false };
  const right = { setId: "s", itemId: "1", correct: true };

  it("un fallo añade el ítem sin aciertos", () => {
    expect(updateMistakes({}, [wrong], day1)[mistakeKey("s", "1")]).toMatchObject({
      count: 1,
      rightDays: [],
    });
  });

  it("acertar dos veces el mismo día no basta; en días distintos, sale", () => {
    let m = updateMistakes({}, [wrong], day1);
    m = updateMistakes(m, [right], day1);
    m = updateMistakes(m, [right], day1Later);
    expect(m[mistakeKey("s", "1")]?.rightDays).toEqual(["2026-10-30"]);
    m = updateMistakes(m, [right], day2);
    expect(m[mistakeKey("s", "1")]).toBeUndefined();
  });

  it("volver a fallar pone a cero los aciertos", () => {
    let m = updateMistakes({}, [wrong], day1);
    m = updateMistakes(m, [right], day1);
    m = updateMistakes(m, [wrong], day2);
    expect(m[mistakeKey("s", "1")]).toMatchObject({ count: 2, rightDays: [] });
  });

  it("acertar un ítem que no estaba en la lista no hace nada", () => {
    expect(updateMistakes({}, [right], day1)).toEqual({});
  });

  it("applyReview actualiza errores y racha, pero no los intentos", () => {
    const data = applyReview(initialProgress, [wrong], day1);
    expect(Object.keys(data.mistakes)).toEqual([mistakeKey("s", "1")]);
    expect(data.attempts).toEqual({});
    expect(data.streak?.days).toBe(1);
  });
});

describe("migrateProgress", () => {
  it("v1 → v2: los errores ganan rightDays vacío y se conserva lo demás", () => {
    const v1 = {
      attempts: { s: { best: 80, last: 60, count: 2, at: "2026-10-01T00:00:00.000Z" } },
      mistakes: { "s#1": { setId: "s", itemId: "1", count: 3, at: "2026-10-01T00:00:00.000Z" } },
      streak: { days: 2, lastDay: "2026-10-01" },
      lastSetId: "s",
    };
    expect(migrateProgress(v1, 1)).toEqual({
      ...v1,
      mistakes: { "s#1": { ...v1.mistakes["s#1"], rightDays: [] } },
    });
  });

  it("descarta lo que no tiene sentido en vez de romper la app", () => {
    expect(migrateProgress("basura", 1)).toEqual(initialProgress);
    const data = migrateProgress(
      { attempts: { x: { best: "mucho" } }, mistakes: { y: 42 }, streak: 7, lastSetId: 1 },
      1,
    );
    expect(data).toEqual(initialProgress);
  });
});
