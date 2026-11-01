import { describe, expect, it } from "vitest";
import type { Attempt } from "@/features/progress/logic";
import { groupByLevel, recommendedUnit, shownStatus, unitSequence, unitStatus } from "./logic";

const unit = {
  guided: ["u-guiada"],
  free: ["u-libre"],
  worksheets: ["verb-to-be"],
  review: "u-repaso",
};

const attempt = (best: number): Attempt => ({ best, last: best, count: 1, at: "2026-10-30" });

describe("unitSequence", () => {
  it("sigue el orden de la plantilla: guiada, libre, worksheet, repaso", () => {
    expect(unitSequence(unit)).toEqual(["u-guiada", "u-libre", "verb-to-be", "u-repaso"]);
  });
});

describe("unitStatus", () => {
  it("sin intentos, la unidad está sin empezar", () => {
    expect(unitStatus(unit, {})).toBe("new");
  });

  it("cualquier set hecho, incluido el worksheet, la marca como empezada", () => {
    expect(unitStatus(unit, { "verb-to-be": attempt(50) })).toBe("started");
  });

  it("práctica y repaso hechos (sin el worksheet) → completada", () => {
    const attempts = { "u-guiada": attempt(90), "u-libre": attempt(60), "u-repaso": attempt(70) };
    expect(unitStatus(unit, attempts)).toBe("completed");
  });

  it("repaso con 80 % o más → dominada, aunque falte práctica", () => {
    expect(unitStatus(unit, { "u-repaso": attempt(80) })).toBe("mastered");
    expect(unitStatus(unit, { "u-repaso": attempt(79) })).toBe("started");
  });
});

describe("recommendedUnit", () => {
  const units = [
    { slug: "a", meta: { review: "a-repaso" } },
    { slug: "b", meta: { review: "b-repaso" } },
  ];

  it("recomienda la primera unidad no dominada", () => {
    expect(recommendedUnit(units, {})?.slug).toBe("a");
    expect(recommendedUnit(units, { "a-repaso": attempt(100) })?.slug).toBe("b");
  });

  it("si todo está dominado, no recomienda ninguna", () => {
    const all = { "a-repaso": attempt(90), "b-repaso": attempt(85) };
    expect(recommendedUnit(units, all)).toBeUndefined();
  });
});

describe("groupByLevel", () => {
  it("agrupa por nivel en el orden en que aparecen las unidades", () => {
    const u = (slug: string, level: "A1" | "A2" | "B1") => ({ slug, meta: { level } });
    const [a, b, c, d] = [u("a", "A1"), u("b", "A1"), u("c", "A2"), u("d", "B1")];
    expect(groupByLevel([a, b, c, d])).toEqual([
      ["A1", [a, b]],
      ["A2", [c]],
      ["B1", [d]],
    ]);
  });

  it("sin unidades no hay bloques", () => {
    expect(groupByLevel([])).toEqual([]);
  });
});

describe("con la prueba de nivel", () => {
  const units = [
    { slug: "a", meta: { review: "a-repaso" } },
    { slug: "b", meta: { review: "b-repaso" } },
    { slug: "c", meta: { review: "c-repaso" } },
  ];

  it("la recomendada empieza en la unidad de la prueba", () => {
    expect(recommendedUnit(units, {}, "b")?.slug).toBe("b");
    expect(recommendedUnit(units, { "b-repaso": attempt(90) }, "b")?.slug).toBe("c");
  });

  it("si todo lo posterior está dominado, vuelve a la primera sin dominar", () => {
    const attempts = { "b-repaso": attempt(90), "c-repaso": attempt(90) };
    expect(recommendedUnit(units, attempts, "b")?.slug).toBe("a");
  });

  it("las anteriores sin empezar se muestran como vistas; las empezadas, no", () => {
    expect(shownStatus(units[0]!, units, {}, "c")).toBe("seen");
    expect(shownStatus(units[2]!, units, {}, "c")).toBe("new");
    expect(shownStatus(units[0]!, units, { "a-repaso": attempt(50) }, "c")).not.toBe("seen");
    expect(shownStatus(units[0]!, units, {}, null)).toBe("new");
  });
});
