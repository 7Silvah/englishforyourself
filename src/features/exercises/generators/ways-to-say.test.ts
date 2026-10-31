import { describe, expect, it } from "vitest";
import { ExerciseSet } from "../schema";
import { generateWaysToSaySet, type ExpressionList } from "./ways-to-say";

const list = (
  slug: string,
  titleEs: string,
  expressions: string[],
  related: string[] = [],
): ExpressionList => ({ path: `ways-to-say/${slug}`, title: slug, titleEs, related, expressions });

const thanks = list("thanks", "Dar las gracias", [
  "Thanks a lot.",
  "I owe you one.",
  "Many thanks!",
  "I really appreciate it.",
  "Thank you so much.",
  "Thanks a million.",
  "I can’t thank you enough.",
  "Thank you for everything.",
  "Thanks for being there for me.",
  "I don’t know how to thank you.",
  "Much appreciated!",
]);
const hello = list(
  "hello",
  "Saludar",
  ["Hi there.", "Good morning.", "What’s new?", "Howdy!"],
  ["ways-to-say/how"],
);
const how = list(
  "how",
  "Preguntar qué tal",
  ["How’s it going?", "What’s new?", "What’s up?"],
  ["ways-to-say/hello"],
);
const bye = list("bye", "Despedirte", ["See you later!", "Take care!", "Bye for now!", "Later!"]);
const all = [thanks, hello, how, bye];

describe("generateWaysToSaySet", () => {
  it("genera un set válido con opción múltiple, clasificar, ordenar y dictado", () => {
    const set = generateWaysToSaySet("A2", thanks, all, "s");
    expect(ExerciseSet.safeParse(set).success).toBe(true);
    expect(new Set(set.items.map((i) => i.type))).toEqual(
      new Set(["multiple-choice", "categorize", "word-order", "dictation"]),
    );
  });

  it("la correcta es de la lista y las incorrectas, de otras listas", () => {
    for (const seed of ["a", "b", "c"])
      for (const item of generateWaysToSaySet("A2", thanks, all, seed).items) {
        if (item.type !== "multiple-choice") continue;
        expect(item.prompt).toBe("¿Qué dirías para dar las gracias?");
        expect(thanks.expressions).toContain(item.options[0]);
        for (const wrong of item.options.slice(1)) expect(thanks.expressions).not.toContain(wrong);
      }
  });

  it("no usa como incorrectas las expresiones de listas relacionadas ni las repetidas", () => {
    for (const seed of ["a", "b", "c", "d", "e"])
      for (const item of generateWaysToSaySet("A2", hello, all, seed).items) {
        if (item.type !== "multiple-choice") continue;
        for (const wrong of item.options.slice(1)) {
          expect(how.expressions).not.toContain(wrong);
          expect(wrong).not.toBe("What’s new?");
        }
      }
  });

  it("la misma semilla da el mismo set", () => {
    expect(generateWaysToSaySet("A2", thanks, all, "z")).toEqual(
      generateWaysToSaySet("A2", thanks, all, "z"),
    );
  });
});
