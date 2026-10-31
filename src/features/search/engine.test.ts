import { describe, expect, it } from "vitest";
import { createSearchIndex, foldTerm, groupHits, search, type SearchDoc } from "./engine";

const docs: SearchDoc[] = [
  {
    id: "u:verbo-to-be",
    type: "unit",
    title: "El verbo to be (ser y estar)",
    subtitle: "The Verb To Be",
    target: { kind: "unit", slug: "verbo-to-be" },
  },
  {
    id: "l:verb-tenses/present-perfect-tense",
    type: "lesson",
    title: "Present Perfect Tense",
    subtitle: "Tiempos verbales",
    target: { kind: "lesson", section: "verb-tenses", slug: "present-perfect-tense" },
  },
  {
    id: "w:animals:1",
    type: "word",
    title: "Hedgehog",
    subtitle: "Erizo",
    target: { kind: "lesson", section: "vocabulary", slug: "animals-vocabulary" },
  },
  {
    id: "s:pasado-simple-guiada",
    type: "set",
    title: "Pasado simple: práctica guiada",
    text: "Past simple guided practice",
    target: { kind: "set", id: "pasado-simple-guiada" },
  },
];

const index = createSearchIndex(docs);
const ids = (query: string) => search(index, query).map((h) => h.id);

describe("buscador", () => {
  it("quita mayúsculas y tildes", () => {
    expect(foldTerm("Práctica")).toBe("practica");
  });

  it("encuentra por prefijo y sin tildes", () => {
    expect(ids("pres")).toContain("l:verb-tenses/present-perfect-tense");
    expect(ids("practica guiada")).toEqual(["s:pasado-simple-guiada"]);
  });

  it("busca en inglés y en español", () => {
    expect(ids("erizo")).toEqual(["w:animals:1"]);
    expect(ids("hedgehog")).toEqual(["w:animals:1"]);
    expect(ids("ser y estar")).toEqual(["u:verbo-to-be"]);
  });

  it("tolera una errata en palabras largas", () => {
    expect(ids("hedgehgo")).toEqual(["w:animals:1"]);
  });

  it("todas las palabras de la consulta deben aparecer", () => {
    expect(ids("present erizo")).toEqual([]);
  });

  it("no busca con menos de 2 letras", () => {
    expect(ids("p")).toEqual([]);
  });

  it("agrupa por tipo en orden fijo", () => {
    const groups = groupHits(search(index, "e"));
    expect(groups).toEqual([]);
    const all = groupHits(search(index, "to be"));
    expect(all.map((g) => g.type)).toEqual(["unit"]);
  });
});
