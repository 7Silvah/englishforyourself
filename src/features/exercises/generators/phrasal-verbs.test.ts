import { describe, expect, it } from "vitest";
import { checkItem } from "../check";
import { ExerciseSet } from "../schema";
import {
  blankParticle,
  generatePhrasalVerbSet,
  particleMatches,
  type PhrasalVerb,
} from "./phrasal-verbs";

const words: PhrasalVerb[] = [
  { en: "To give up", es: "rendirse", particle: "up", example: "Don't give up now." },
  { en: "To give in", es: "ceder", particle: "in", example: "She finally gave in." },
  { en: "To look after", es: "cuidar", particle: "after", example: "I look after my sister." },
  { en: "To run out of", es: "quedarse sin", particle: "out of", example: "We ran out of milk." },
  { en: "To take off", es: "despegar", particle: "off", example: "The plane took off late." },
  { en: "To find out", es: "averiguar", particle: "out", example: "Find out the time." },
  { en: "To get by", es: "arreglárselas", particle: "by", example: "We get by on little." },
  { en: "To carry on", es: "seguir", particle: "on", example: "Carry on, please." },
  { en: "To break down", es: "averiarse", particle: "down", example: "My car broke down." },
  { en: "To show off", es: "presumir", particle: "off", example: "He likes to show off." },
];

describe("particleMatches y blankParticle", () => {
  it("solo cuenta palabras completas", () => {
    expect(particleMatches("Go outside and find out.", "out")).toHaveLength(1);
    expect(particleMatches("We ran OUT OF milk.", "out of")).toHaveLength(1);
    expect(particleMatches("Turn it in.", "on")).toHaveLength(0);
  });

  it("pone el hueco en la partícula", () => {
    expect(blankParticle("We ran out of milk.", "out of")).toBe("We ran ___ milk.");
    expect(blankParticle("Pick it up!", "up")).toBe("Pick it ___!");
  });
});

describe("generatePhrasalVerbSet", () => {
  it("genera un set válido con partículas, significados y emparejar", () => {
    const set = generatePhrasalVerbSet("Common phrasal verbs", "B1", words, "s");
    expect(ExerciseSet.safeParse(set).success).toBe(true);
    expect(new Set(set.items.map((i) => i.type))).toEqual(
      new Set(["multiple-choice", "fill-blank", "match"]),
    );
  });

  it("la partícula correcta es la primera opción y las incorrectas no forman otro phrasal verb", () => {
    for (const seed of ["a", "b", "c"])
      for (const item of generatePhrasalVerbSet("L", "B1", words, seed).items) {
        if (item.type === "fill-blank") {
          const word = words.find(
            (w) => item.text === blankParticle(w.example ?? "", w.particle ?? ""),
          );
          expect(
            checkItem(item, { type: "fill-blank", values: [word?.particle ?? ""] }).status,
          ).toBe("correct");
        }
        if (item.type !== "multiple-choice" || !item.prompt.includes("___")) continue;
        const word = words.find(
          (w) => item.prompt === blankParticle(w.example ?? "", w.particle ?? ""),
        );
        expect(item.options[0]).toBe(word?.particle);
        expect(new Set(item.options).size).toBe(item.options.length);
        // "give" ya tiene "up" e "in": ninguna de las dos puede ser la opción incorrecta de la otra
        if (word?.en === "To give up") expect(item.options).not.toContain("in");
      }
  });

  it("si todas las partículas son iguales, practica solo significados", () => {
    const away: PhrasalVerb[] = ["throw", "give", "run", "go", "put"].map((v) => ({
      en: `To ${v} away`,
      es: v,
      particle: "away",
      example: `Please ${v} away.`,
    }));
    const set = generatePhrasalVerbSet("Away", "B1", away, "s");
    expect(set.items.some((i) => i.type === "fill-blank")).toBe(false);
    expect(set.items.filter((i) => i.type === "multiple-choice").length).toBeGreaterThan(0);
  });

  it("la misma semilla da el mismo set", () => {
    expect(generatePhrasalVerbSet("L", "B1", words, "z")).toEqual(
      generatePhrasalVerbSet("L", "B1", words, "z"),
    );
  });
});
