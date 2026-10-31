import { describe, expect, it } from "vitest";
import type { UnitMeta } from "@/content/schema";
import type { ExerciseSet } from "@/features/exercises/schema";
import type { Attempt, Mistake } from "@/features/progress/logic";
import { multipleChoice, trueFalse, transform } from "@/test/fixtures";
import {
  masteredUnits,
  mistakeItems,
  mixedItems,
  mixedSetIds,
  pendingMistakes,
  reviewOutcomes,
  sourceOf,
} from "./logic";

const set = (items: ExerciseSet["items"]): ExerciseSet => ({
  title: "t",
  titleEs: "t",
  instructionEs: "i",
  source: "original",
  level: "A1",
  items,
});

const sets = new Map([
  ["a", set([multipleChoice, trueFalse])],
  ["b", set([transform])],
]);

const mistake = (setId: string, itemId: string, at: string): Mistake => ({
  setId,
  itemId,
  count: 1,
  at,
  rightDays: [],
});

describe("Repasar mis errores", () => {
  it("ordena los errores del más antiguo al más reciente", () => {
    const list = pendingMistakes({
      x: mistake("a", "tf", "2026-10-30T10:00:00Z"),
      y: mistake("b", "tr", "2026-10-29T10:00:00Z"),
    });
    expect(list.map((m) => m.itemId)).toEqual(["tr", "tf"]);
  });

  it("crea ítems con id «set#ítem» e ignora los que ya no existen", () => {
    const items = mistakeItems(
      [mistake("a", "tf", ""), mistake("a", "borrado", ""), mistake("z", "1", "")],
      sets,
    );
    expect(items.map((i) => i.id)).toEqual(["a#tf"]);
    expect(items[0]?.type).toBe("true-false");
  });

  it("respeta el límite por ronda", () => {
    const many = Array.from({ length: 30 }, () => mistake("a", "mc", ""));
    expect(mistakeItems(many, sets, 20)).toHaveLength(20);
  });

  it("traduce los resultados de la sesión a set e ítem originales", () => {
    expect(sourceOf("verbo-to-be-guiada#3")).toEqual({ setId: "verbo-to-be-guiada", itemId: "3" });
    expect(reviewOutcomes([{ item: { id: "a#tf" }, correct: true }])).toEqual([
      { setId: "a", itemId: "tf", correct: true },
    ]);
  });
});

describe("Repaso mixto", () => {
  const unit = (review: string, guided: string): { meta: UnitMeta } => ({
    meta: {
      number: 1,
      block: "fundamentos-1",
      title: "t",
      titleEs: "t",
      summaryEs: "s",
      level: "A1",
      objectivesEs: ["a", "b"],
      guided: [guided],
      review,
    },
  });
  const attempt = (best: number): Attempt => ({ best, last: best, count: 1, at: "" });

  it("solo cuentan las unidades dominadas", () => {
    const units = [unit("r1", "g1"), unit("r2", "g2")];
    const mastered = masteredUnits(units, { r1: attempt(90), r2: attempt(50) });
    expect(mastered).toHaveLength(1);
    expect(mixedSetIds(mastered)).toEqual(["g1", "r1"]);
  });

  it("baraja con semilla y toma como mucho N ítems", () => {
    const a = mixedItems(sets, "x", 2);
    expect(a).toHaveLength(2);
    expect(mixedItems(sets, "x", 2)).toEqual(a);
    expect(mixedItems(sets, "x", 10)).toHaveLength(3);
  });
});
