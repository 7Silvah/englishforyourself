import { describe, expect, it } from "vitest";
import { ExerciseSet } from "../schema";
import { checkItem } from "../check";
import { generateVocabularySet, sameMeaning, type VocabWord } from "./vocabulary";

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

describe("sameMeaning", () => {
  it("dos palabras con alguna traducción en común, o la misma palabra", () => {
    expect(
      sameMeaning({ en: "Grateful", es: "agradecido" }, { en: "Thankful", es: "agradecido" }),
    ).toBe(true);
    expect(sameMeaning({ en: "Cake", es: "pastel / tarta" }, { en: "Tart", es: "tarta" })).toBe(
      true,
    );
    expect(sameMeaning({ en: "Hand", es: "mano" }, { en: "Hand", es: "mano" })).toBe(true);
  });

  it("las aclaraciones entre paréntesis no cuentan", () => {
    expect(
      sameMeaning({ en: "Sloth", es: "perezoso (animal)" }, { en: "Lazy", es: "perezoso" }),
    ).toBe(true);
    expect(
      sameMeaning({ en: "Kiwi", es: "kiwi (ave)" }, { en: "Dove", es: "paloma (tórtola)" }),
    ).toBe(false);
  });
});

describe("distractores", () => {
  // Muchos sinónimos: si uno sale como distractor del otro, la pregunta tiene dos respuestas
  const synonyms: VocabWord[] = [
    { en: "Afraid", es: "asustado / con miedo" },
    { en: "Frightened", es: "asustado" },
    { en: "Grateful", es: "agradecido" },
    { en: "Thankful", es: "agradecido" },
    { en: "Shy", es: "tímido" },
    { en: "Timid", es: "tímido" },
    { en: "Bashful", es: "vergonzoso / tímido" },
    { en: "Angry", es: "enojado / enfadado" },
    { en: "Mad", es: "enojado (EE. UU.) / loco" },
    { en: "Happy", es: "feliz" },
  ];

  it("ninguna opción incorrecta comparte traducción con la correcta, ni en el emparejar", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"])
      for (const item of generateVocabularySet("Feelings", "A2", synonyms, seed).items) {
        if (item.type === "multiple-choice") {
          const word = synonyms.find((w) => w.en === item.prompt || w.es === item.prompt);
          if (!word) throw new Error("palabra no encontrada");
          for (const option of item.options.slice(1)) {
            const other = synonyms.find((w) => w.en === option || w.es === option);
            if (other) expect(sameMeaning(word, other)).toBe(false);
          }
        }
        if (item.type === "match")
          for (const [i, p] of item.pairs.entries())
            for (const q of item.pairs.slice(i + 1))
              expect(sameMeaning({ en: p.left, es: p.right }, { en: q.left, es: q.right })).toBe(
                false,
              );
      }
  });
});
