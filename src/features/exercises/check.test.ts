import { describe, expect, it } from "vitest";
import {
  errorCorrection,
  fillBlank,
  multipleChoice,
  transform,
  trueFalse,
  wordOrder,
} from "@/test/fixtures";
import {
  canonical,
  checkItem,
  checkText,
  combine,
  editDistance,
  emptyResponse,
  hasAnswer,
  normalize,
  wordOrderDisplay,
  wordOrderTokens,
  wrongTokenIndices,
} from "./check";

describe("normalize", () => {
  it("ignora mayúsculas, espacios de más y el punto final", () => {
    expect(normalize("  She   WORKS here. ")).toBe("she works here");
    expect(normalize("Does she work here?")).toBe("does she work here");
  });

  it("convierte comillas tipográficas en rectas", () => {
    expect(normalize("didn’t")).toBe("didn't");
    expect(normalize("‘ve")).toBe("'ve");
  });

  it("quita el espacio antes de la puntuación", () => {
    expect(normalize("Yes , I do")).toBe("yes, i do");
  });
});

describe("canonical", () => {
  it.each([
    ["don't", "do not"],
    ["doesn’t", "does not"],
    ["won't", "will not"],
    ["can't", "can not"],
    ["cannot", "can not"],
    ["I'm", "i am"],
    ["they're", "they are"],
    ["we've", "we have"],
    ["she'll", "she will"],
    ["’ve been learning", "have been learning"],
  ])("%s → %s", (input, expected) => {
    expect(canonical(input)).toBe(expected);
  });

  it("no desarrolla las contracciones ambiguas 's y 'd", () => {
    expect(canonical("she's")).toBe("she's");
    expect(canonical("I'd")).toBe("i'd");
  });
});

describe("editDistance", () => {
  it("cuenta inserciones, borrados y cambios", () => {
    expect(editDistance("work", "works")).toBe(1);
    expect(editDistance("drove", "drived")).toBe(2);
    expect(editDistance("same", "same")).toBe(0);
  });

  it("cuenta como 1 el intercambio de dos letras", () => {
    expect(editDistance("teh", "the")).toBe(1);
    expect(editDistance("recieve", "receive")).toBe(1);
  });
});

describe("checkText", () => {
  it("acepta cualquiera de las respuestas válidas", () => {
    expect(checkText("traveled", ["travelled", "traveled"])).toBe("correct");
    expect(checkText("Travelled.", ["travelled"])).toBe("correct");
  });

  it("acepta la contracción no ambigua aunque no esté en answers", () => {
    expect(checkText("did not bring", ["didn’t bring"])).toBe("correct");
    expect(checkText("didn't bring", ["did not bring"])).toBe("correct");
    expect(checkText("cannot swim", ["can't swim"])).toBe("correct");
  });

  it("solo acepta 's y 'd si están en answers", () => {
    expect(checkText("she's", ["she is"])).toBe("wrong");
    expect(checkText("she's", ["she is", "she's"])).toBe("correct");
  });

  it("marca como casi una falta de ortografía", () => {
    expect(checkText("travled", ["traveled"])).toBe("almost");
    expect(checkText("recieved", ["received"])).toBe("almost");
    expect(checkText("dont like", ["don't like"])).toBe("almost");
  });

  it("no confunde errores de gramática al final de la palabra con faltas", () => {
    expect(checkText("work", ["works"])).toBe("wrong");
    expect(checkText("play", ["played"])).toBe("wrong");
    expect(checkText("walked", ["walks"])).toBe("wrong");
  });

  it("no da casi en palabras cortas (a / an)", () => {
    expect(checkText("a", ["an"])).toBe("wrong");
    expect(checkText("the", ["they"])).toBe("wrong");
  });

  it("una respuesta vacía está mal", () => {
    expect(checkText("   ", ["anything"])).toBe("wrong");
  });

  it("allowAlmost: false desactiva el casi", () => {
    expect(checkText("travled", ["traveled"], { allowAlmost: false })).toBe("wrong");
  });
});

describe("combine", () => {
  it("todo bien → correct; algo mal → wrong; si no, almost", () => {
    expect(combine(["correct", "correct"])).toBe("correct");
    expect(combine(["correct", "almost"])).toBe("almost");
    expect(combine(["almost", "wrong"])).toBe("wrong");
  });
});

describe("checkItem", () => {
  it("fill-blank corrige cada hueco por separado", () => {
    const result = checkItem(fillBlank, {
      type: "fill-blank",
      values: ["traveled", "visit"],
    });
    expect(result).toEqual({ status: "wrong", parts: ["correct", "wrong"] });
  });

  it("multiple-choice y true-false comparan la opción elegida", () => {
    expect(checkItem(multipleChoice, { type: "multiple-choice", choice: 1 }).status).toBe(
      "correct",
    );
    expect(checkItem(multipleChoice, { type: "multiple-choice", choice: 0 }).status).toBe("wrong");
    expect(checkItem(trueFalse, { type: "true-false", choice: false }).status).toBe("correct");
    expect(checkItem(trueFalse, { type: "true-false", choice: null }).status).toBe("wrong");
  });

  it("word-order une las fichas y no admite casi", () => {
    // Fichas: Does she work here? do
    expect(checkItem(wordOrder, { type: "word-order", tokens: [0, 1, 2, 3] }).status).toBe(
      "correct",
    );
    expect(checkItem(wordOrder, { type: "word-order", tokens: [4, 1, 2, 3] }).status).toBe("wrong");
  });

  it("transform acepta la forma sin contraer", () => {
    expect(checkItem(transform, { type: "transform", text: "she does not work here" }).status).toBe(
      "correct",
    );
  });

  it("error-correction exige la palabra correcta y la corrección", () => {
    const ok = checkItem(errorCorrection, { type: "error-correction", token: 1, text: "doesn't" });
    expect(ok).toEqual({ status: "correct", parts: ["correct", "correct"] });
    const wrongWord = checkItem(errorCorrection, {
      type: "error-correction",
      token: 2,
      text: "doesn't",
    });
    expect(wrongWord.status).toBe("wrong");
    const typo = checkItem(errorCorrection, { type: "error-correction", token: 1, text: "doesnt" });
    expect(typo.status).toBe("almost");
  });

  it("una respuesta de otro tipo está mal", () => {
    expect(checkItem(transform, { type: "multiple-choice", choice: 1 }).status).toBe("wrong");
  });
});

describe("ayudas por tipo", () => {
  it("wordOrderTokens añade los distractores al final", () => {
    expect(wordOrderTokens(wordOrder)).toEqual(["Does", "she", "work", "here?", "do"]);
  });

  it("wordOrderDisplay es reproducible y nunca sale ya ordenado", () => {
    const a = wordOrderDisplay(wordOrder, "seed");
    expect(wordOrderDisplay(wordOrder, "seed")).toEqual(a);
    expect([...a].sort()).toEqual([0, 1, 2, 3, 4]);
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const order = wordOrderDisplay({ ...wordOrder, distractors: [] }, seed);
      expect(order).not.toEqual([0, 1, 2, 3]);
    }
  });

  it("wrongTokenIndices encuentra fragmentos de varias palabras", () => {
    expect(wrongTokenIndices(errorCorrection)).toEqual([1]);
    expect(
      wrongTokenIndices({
        ...errorCorrection,
        sentence: "I am agree with you.",
        wrong: "am agree",
      }),
    ).toEqual([1, 2]);
  });

  it("hasAnswer detecta respuestas vacías", () => {
    expect(hasAnswer(emptyResponse(fillBlank))).toBe(false);
    expect(hasAnswer({ type: "fill-blank", values: ["", "x"] })).toBe(true);
    expect(hasAnswer(emptyResponse(errorCorrection))).toBe(false);
  });
});
