import { describe, expect, it } from "vitest";
import {
  categorize,
  dictation,
  listenChoose,
  match,
  tableFill,
  translateBank,
  translateTyped,
} from "@/test/fixtures";
import {
  categorizeDisplay,
  categorizeItems,
  checkItem,
  emptyResponse,
  hasAnswer,
  matchDisplay,
  needsAudio,
  tableBlanks,
} from "./check";
import { answerKey, responseText, solutionSentence } from "./solution";

describe("match", () => {
  it("corrige cada pareja por separado", () => {
    expect(checkItem(match, { type: "match", pairs: [0, 2, 1] })).toEqual({
      status: "wrong",
      parts: ["correct", "wrong", "wrong"],
    });
    expect(checkItem(match, { type: "match", pairs: [0, 1, 2] }).status).toBe("correct");
  });

  it("la columna derecha nunca sale ya emparejada", () => {
    for (const seed of ["a", "b", "c", "d"])
      expect(matchDisplay(match, seed)).not.toEqual([0, 1, 2]);
  });

  it("muestra las parejas como solución y la respuesta del estudiante", () => {
    expect(solutionSentence(match)).toBe("I = am · she = is · we = are");
    expect(responseText(match, { type: "match", pairs: [1, null, 2] })).toBe(
      "I = is · she = … · we = are",
    );
  });
});

describe("categorize", () => {
  it("aplana las palabras con su categoría", () => {
    expect(categorizeItems(categorize)).toEqual([
      { text: "book", category: 0 },
      { text: "car", category: 0 },
      { text: "apple", category: 1 },
      { text: "hour", category: 1 },
    ]);
    expect([...categorizeDisplay(categorize, "x")].sort()).toEqual([0, 1, 2, 3]);
  });

  it("una palabra sin colocar cuenta como fallo", () => {
    const result = checkItem(categorize, { type: "categorize", placed: [0, 0, 1, null] });
    expect(result).toEqual({ status: "wrong", parts: ["correct", "correct", "correct", "wrong"] });
  });

  it("la solución agrupa las palabras por categoría", () => {
    expect(solutionSentence(categorize)).toBe("a: book, car · an: apple, hour");
  });
});

describe("translate", () => {
  it("con banco de palabras compara las fichas, sin casi", () => {
    expect(
      checkItem(translateBank, { type: "translate", text: "", tokens: [0, 1, 2, 4] }).status,
    ).toBe("correct");
    expect(
      checkItem(translateBank, { type: "translate", text: "", tokens: [0, 1, 3, 4] }).status,
    ).toBe("wrong");
  });

  it("escribiendo acepta contracciones y avisa de faltas", () => {
    expect(
      checkItem(translateTyped, { type: "translate", text: "I'm hungry", tokens: [] }).status,
    ).toBe("correct");
    expect(
      checkItem(translateTyped, { type: "translate", text: "I am hungyr", tokens: [] }).status,
    ).toBe("almost");
  });
});

describe("dictation y listen-choose", () => {
  it("dictation compara con la frase dictada", () => {
    expect(checkItem(dictation, { type: "dictation", text: "where do you live" }).status).toBe(
      "correct",
    );
  });

  it("listen-choose compara la opción elegida", () => {
    expect(checkItem(listenChoose, { type: "listen-choose", choice: 1 }).status).toBe("wrong");
    expect(answerKey(listenChoose)).toBe("I can't swim.");
  });

  it("solo estos dos tipos necesitan audio", () => {
    expect(needsAudio(dictation)).toBe(true);
    expect(needsAudio(listenChoose)).toBe(true);
    expect(needsAudio(match)).toBe(false);
  });
});

describe("table-fill", () => {
  it("encuentra los huecos en orden de lectura y los corrige", () => {
    expect(tableBlanks(tableFill).map((b) => [b.row, b.col])).toEqual([
      [0, 1],
      [1, 0],
    ]);
    expect(
      checkItem(tableFill, { type: "table-fill", values: ["She does not work.", "They works."] }),
    ).toEqual({ status: "wrong", parts: ["correct", "wrong"] });
  });
});

it("emptyResponse no cuenta como respuesta en ningún tipo nuevo", () => {
  for (const item of [match, categorize, translateBank, dictation, tableFill, listenChoose])
    expect(hasAnswer(emptyResponse(item))).toBe(false);
});
