import { describe, expect, it } from "vitest";
import { ExerciseSet } from "../schema";
import { checkItem } from "../check";
import { generateVocabularySet, type VocabWord } from "./vocabulary";

const words: VocabWord[] = [
  { en: "Red", es: "rojo" },
  { en: "Blue", es: "azul" },
  { en: "Green", es: "verde" },
  { en: "Yellow", es: "amarillo" },
  { en: "Black", es: "negro" },
  { en: "White", es: "blanco" },
  { en: "Pink", es: "rosa / rosado" },
  { en: "Grey or gray", es: "gris" },
  { en: "Lorry (UK) / truck (US)", es: "camión" },
  { en: "Brown", es: "marrón / café" },
];

describe("generateVocabularySet", () => {
  it("genera un set válido con varios tipos", () => {
    const set = generateVocabularySet("Colours", "A1", words, "s");
    expect(ExerciseSet.safeParse(set).success).toBe(true);
    expect(new Set(set.items.map((i) => i.type))).toEqual(
      new Set(["multiple-choice", "match", "listen-choose", "dictation"]),
    );
    expect(set.level).toBe("A1");
  });

  it("la opción correcta es la traducción y las opciones no se repiten", () => {
    for (const item of generateVocabularySet("Colours", "A1", words, "x").items) {
      if (item.type !== "multiple-choice") continue;
      expect(new Set(item.options).size).toBe(item.options.length);
      expect(checkItem(item, { type: "multiple-choice", choice: 0 }).status).toBe("correct");
      const word = words.find((w) => w.en === item.prompt || w.es === item.prompt);
      expect([word?.en, word?.es]).toContain(item.options[0]);
    }
  });

  it("los ejercicios de audio nunca usan palabras con variantes", () => {
    for (const seed of ["a", "b", "c", "d", "e"])
      for (const item of generateVocabularySet("Colours", "A1", words, seed).items) {
        const text =
          item.type === "dictation"
            ? item.text
            : item.type === "listen-choose"
              ? item.audioText
              : "";
        expect(text).not.toMatch(/[()/]| or /);
      }
  });

  it("la misma semilla da el mismo set", () => {
    expect(generateVocabularySet("C", "A1", words, "z")).toEqual(
      generateVocabularySet("C", "A1", words, "z"),
    );
  });
});
