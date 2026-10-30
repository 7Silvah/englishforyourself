import { describe, expect, it } from "vitest";
import type { Attempt } from "@/features/progress/logic";
import { recommendedUnit, unitSequence, unitStatus } from "./logic";

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
