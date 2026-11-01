import { describe, expect, it } from "vitest";
import type { WordGroup } from "@/content/schema";
import { filterGroups, fold, isLevelList, wordType } from "./logic";

const groups: WordGroup[] = [
  {
    title: "A",
    items: [
      { en: "apple", es: "manzana", pos: "noun" },
      { en: "angry", es: "enojado / enfadado", pos: "adjective" },
    ],
  },
  {
    title: "D",
    items: [
      { en: "drink", es: "bebida", pos: "noun" },
      { en: "drink", es: "beber / tomar", pos: "verb" },
      { en: "dress up", pos: "phrasal verb" },
    ],
  },
  { title: "S", items: [{ en: "song", es: "canción", pos: "noun" }] },
];

const words = (result: WordGroup[]) => result.flatMap((g) => g.items.map((w) => w.en));

describe("wordType", () => {
  it("agrupa los verbos y las expresiones", () => {
    expect(wordType("phrasal verb")).toBe("verb");
    expect(wordType("modal verb")).toBe("verb");
    expect(wordType("idiom")).toBe("phrase");
    expect(wordType("noun")).toBe("noun");
  });

  it("deja el resto en «other»", () => {
    expect(wordType("pronoun")).toBe("other");
    expect(wordType("number")).toBe("other");
  });
});

describe("filterGroups", () => {
  it("sin filtros devuelve todo", () => {
    expect(filterGroups(groups, {})).toEqual(groups);
  });

  it("filtra por letra", () => {
    expect(words(filterGroups(groups, { letra: "D" }))).toEqual(["drink", "drink", "dress up"]);
  });

  it("filtra por tipo y quita los grupos vacíos", () => {
    const result = filterGroups(groups, { tipo: "verb" });
    expect(result.map((g) => g.title)).toEqual(["D"]);
    expect(words(result)).toEqual(["drink", "dress up"]);
  });

  it("busca en inglés y en español, sin tildes ni mayúsculas", () => {
    expect(words(filterGroups(groups, { q: "CANCION" }))).toEqual(["song"]);
    expect(words(filterGroups(groups, { q: "enfadado" }))).toEqual(["angry"]);
    expect(words(filterGroups(groups, { q: "app" }))).toEqual(["apple"]);
  });

  it("con texto ignora la letra: busca en todas", () => {
    expect(words(filterGroups(groups, { letra: "A", q: "song" }))).toEqual(["song"]);
  });

  it("un texto solo de espacios no filtra", () => {
    expect(words(filterGroups(groups, { letra: "S", q: "  " }))).toEqual(["song"]);
  });

  it("combina tipo y texto", () => {
    expect(words(filterGroups(groups, { tipo: "noun", q: "drink" }))).toEqual(["drink"]);
  });
});

describe("fold e isLevelList", () => {
  it("quita tildes y diéresis", () => {
    expect(fold("Pingüino Árbol")).toBe("pinguino arbol");
  });

  it("una lista es de nivel si alguna palabra tiene tipo", () => {
    const list = { kind: "wordlist" as const, title: "x", groups };
    expect(isLevelList(list)).toBe(true);
    expect(isLevelList({ ...list, groups: [{ items: [{ en: "cat" }] }] })).toBe(false);
  });
});
