import { describe, expect, it } from "vitest";
import { errorCorrection, fillBlank, multipleChoice, trueFalse, wordOrder } from "@/test/fixtures";
import { finalResult, summarize } from "./player/logic";
import { answerKey, responseText, solutionSentence } from "./solution";

describe("solution", () => {
  it("solutionSentence rellena los huecos con la primera respuesta y quita las pistas", () => {
    expect(solutionSentence(fillBlank)).toBe("I travelled to Korea and visited Seoul.");
    expect(solutionSentence(multipleChoice)).toBe("She drinks coffee every morning.");
    expect(solutionSentence(errorCorrection)).toBe("She doesn't like coffee.");
  });

  it("answerKey da la respuesta corta para la clave impresa", () => {
    expect(answerKey(fillBlank)).toBe("travelled … visited");
    expect(answerKey(trueFalse)).toBe("Falso");
    expect(answerKey(errorCorrection)).toBe("don't → doesn't");
  });

  it("responseText muestra lo que respondió el estudiante", () => {
    expect(responseText(wordOrder, { type: "word-order", tokens: [4, 1, 2, 3] })).toBe(
      "do she work here?",
    );
    expect(responseText(fillBlank, { type: "fill-blank", values: ["went", ""] })).toBe("went … …");
  });
});

describe("player/logic", () => {
  it("en práctica, el primer casi deja reintentar", () => {
    const almost = { status: "almost" as const, parts: ["correct" as const, "almost" as const] };
    expect(finalResult(almost, { mode: "practice", retried: false })).toBe(almost);
  });

  it("en examen o al repetir el casi, cuenta como fallo", () => {
    const almost = { status: "almost" as const, parts: ["correct" as const, "almost" as const] };
    const expected = { status: "wrong", parts: ["correct", "wrong"] };
    expect(finalResult(almost, { mode: "exam", retried: false })).toEqual(expected);
    expect(finalResult(almost, { mode: "practice", retried: true })).toEqual(expected);
  });

  it("summarize cuenta aciertos y fallos", () => {
    const records = [
      {
        item: trueFalse,
        response: { type: "true-false" as const, choice: false },
        result: { status: "correct" as const },
      },
      {
        item: trueFalse,
        response: { type: "true-false" as const, choice: true },
        result: { status: "wrong" as const },
      },
    ];
    const summary = summarize(records);
    expect(summary).toMatchObject({ correct: 1, total: 2, percent: 50 });
    expect(summary.failed).toHaveLength(1);
  });
});
