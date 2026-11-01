import { describe, expect, it } from "vitest";
import { levelScores, recommendedFromTest, unitResults, type Outcome } from "./logic";

const order = ["u1", "u2", "u3", "u4", "u5", "u6"];
// Una pregunta por unidad; los índices de fails son las unidades falladas
const answers = (...fails: number[]): Outcome[] =>
  order.map((unit, i) => ({ unit, correct: !fails.includes(i + 1) }));

describe("unitResults", () => {
  it("una unidad con dos preguntas está bien solo si acierta las dos", () => {
    const outcomes = [
      { unit: "u2", correct: true },
      { unit: "u2", correct: false },
      { unit: "u1", correct: true },
    ];
    expect(unitResults(outcomes, order)).toEqual([
      { unit: "u1", ok: true },
      { unit: "u2", ok: false },
    ]);
  });
});

describe("recommendedFromTest", () => {
  it("recomienda la primera unidad donde empiezan los fallos", () => {
    expect(recommendedFromTest(answers(3, 4, 5, 6), order)).toBe("u3");
    expect(recommendedFromTest(answers(3, 5), order)).toBe("u3"); // otro fallo dos unidades después
  });

  it("un fallo suelto entre aciertos no cuenta", () => {
    expect(recommendedFromTest(answers(2, 5, 6), order)).toBe("u5");
  });

  it("un fallo en la última unidad sí cuenta", () => {
    expect(recommendedFromTest(answers(6), order)).toBe("u6");
  });

  it("sin fallos (o solo despistes), la última unidad", () => {
    expect(recommendedFromTest(answers(), order)).toBe("u6");
    expect(recommendedFromTest(answers(2), order)).toBe("u6");
  });

  it("todo mal: la primera unidad", () => {
    expect(recommendedFromTest(answers(1, 2, 3, 4, 5, 6), order)).toBe("u1");
  });
});

describe("levelScores", () => {
  it("cuenta aciertos por nivel, en orden de dificultad", () => {
    const levelOf = (unit: string) => (unit === "u1" || unit === "u2" ? "A1" : "B1");
    expect(levelScores(answers(2, 3), levelOf)).toEqual([
      { level: "A1", correct: 1, total: 2 },
      { level: "B1", correct: 3, total: 4 },
    ]);
  });
});
