import { describe, expect, it } from "vitest";
import {
  buildVocabulary,
  countByTopic,
  filterGroups,
  fold,
  pageNumbers,
  pageOf,
  wordKeys,
  wordType,
  type VocabularySource,
} from "./logic";
import { parseFilters, parsePracticeSearch, wordFilters } from "./filters";

const starter: VocabularySource = {
  slug: "starter-a1",
  title: "Vocabulario A1 · Starter",
  level: "A1",
  source: "face2face",
  words: [
    { en: "apple", ipa: "ˈæp.l̩", pos: "noun" },
    { en: "drink", es: "bebida", pos: "noun" },
    { en: "drink", es: "beber / tomar", pos: "verb" },
  ],
};
const elementary: VocabularySource = {
  slug: "elementary-a2",
  title: "Vocabulario A2 · Elementary",
  level: "A2",
  source: "face2face",
  words: [
    { en: "apple", ipa: "ˈæp.l̩", pos: "noun" },
    { en: "angry", pos: "adjective" },
  ],
};
const fruits: VocabularySource = {
  slug: "fruits",
  title: "Frutas",
  words: [
    { en: "Apple", es: "manzana", level: "A1" },
    { en: "Shaddock", es: "pomelo", level: "C1" },
  ],
};
const house: VocabularySource = {
  slug: "house",
  title: "La casa",
  words: [
    { en: "Fork", es: "tenedor", level: "A2" },
    { en: "Lorry (UK) / truck (US)", es: "camión", level: "B1" },
  ],
};
const dining: VocabularySource = {
  slug: "dining",
  title: "El comedor",
  words: [{ en: "Fork", es: "tenedor", level: "A2" }],
};

const groups = buildVocabulary([fruits, house, dining, elementary, starter]);
const all = groups.flatMap((g) => g.items);
const words = (result: ReturnType<typeof filterGroups>) =>
  result.flatMap((g) => g.items.map((w) => `${w.en}${w.pos ? ` (${w.pos})` : ""}`));

describe("buildVocabulary", () => {
  it("una palabra de dos libros queda una vez, con el nivel más fácil", () => {
    const apples = all.filter((e) => e.en.toLowerCase() === "apple");
    expect(apples).toHaveLength(1);
    expect(apples[0]).toMatchObject({ en: "apple", level: "A1", ipa: "ˈæp.l̩" });
  });

  it("la palabra del tema se junta con la del libro: gana el tema y la traducción", () => {
    const apple = all.find((e) => e.en === "apple");
    expect(apple?.topics).toEqual([{ slug: "fruits", title: "Frutas" }]);
    expect(apple?.es).toBe("manzana");
  });

  it("no pisa la traducción que ya tiene el libro", () => {
    expect(all.find((e) => e.id === "drink|noun")?.es).toBe("bebida");
  });

  it("una palabra en dos temas es una fila con los dos", () => {
    const forks = all.filter((e) => e.en === "Fork");
    expect(forks).toHaveLength(1);
    expect(forks[0]?.topics.map((t) => t.slug)).toEqual(["house", "dining"]);
  });

  it("las palabras solo de temas llevan su nivel y su tema", () => {
    expect(all.find((e) => e.en === "Shaddock")).toMatchObject({
      level: "C1",
      topics: [{ slug: "fruits", title: "Frutas" }],
    });
  });

  it("ordena por letra sin paréntesis y agrupa", () => {
    expect(groups.map((g) => g.title)).toEqual(["A", "D", "F", "L", "S"]);
    expect(groups[0]?.items.map((e) => e.en)).toEqual(["angry", "apple"]);
  });

  it("los ids son únicos", () => {
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
  });
});

describe("filterGroups", () => {
  it("sin filtros devuelve todo", () => {
    expect(filterGroups(groups, {})).toEqual(groups);
  });

  it("filtra por nivel y por tema", () => {
    expect(words(filterGroups(groups, { nivel: "A2" }))).toEqual(["angry (adjective)", "Fork"]);
    expect(words(filterGroups(groups, { tema: "fruits" }))).toEqual(["apple (noun)", "Shaddock"]);
  });

  it("filtra por tipo: las palabras sin tipo quedan fuera", () => {
    expect(words(filterGroups(groups, { tipo: "verb" }))).toEqual(["drink (verb)"]);
  });

  it("busca en inglés y en español, sin tildes ni mayúsculas, en todas las letras", () => {
    expect(words(filterGroups(groups, { q: "CAMION", letra: "A" }))).toEqual([
      "Lorry (UK) / truck (US)",
    ]);
    expect(words(filterGroups(groups, { q: "tomar" }))).toEqual(["drink (verb)"]);
  });

  it("filtra por letra y un texto solo de espacios no filtra", () => {
    expect(words(filterGroups(groups, { letra: "S", q: "  " }))).toEqual(["Shaddock"]);
  });
});

describe("lista principal (home)", () => {
  it("es la de Face2Face si la palabra está en el libro y, si no, su primer tema", () => {
    expect(all.find((e) => e.en === "apple")?.home).toBe("starter-a1");
    expect(all.find((e) => e.en === "Fork")?.home).toBe("house");
  });
});

describe("favoritas", () => {
  it("con fav=true solo quedan las marcadas", () => {
    const favorites = new Set(["t:shaddock", "drink|verb"]);
    expect(words(filterGroups(groups, { fav: true }, favorites))).toEqual([
      "drink (verb)",
      "Shaddock",
    ]);
  });

  it("sin fav las marcadas no filtran nada", () => {
    expect(filterGroups(groups, {}, new Set(["t:shaddock"]))).toEqual(groups);
  });
});

describe("pageOf y pageNumbers", () => {
  it("corta por páginas sin dejar grupos vacíos", () => {
    const sizes = (page: number) => pageOf(groups, page, 2).map((g) => [g.title, g.items.length]);
    expect(sizes(1)).toEqual([["A", 2]]);
    expect(sizes(2)).toEqual([["D", 2]]);
    expect(sizes(3)).toEqual([
      ["F", 1],
      ["L", 1],
    ]);
    expect(sizes(4)).toEqual([["S", 1]]);
    expect(sizes(5)).toEqual([]);
  });

  it("muestra la primera, la última y las vecinas, con «…» entre medias", () => {
    expect(pageNumbers(1, 1)).toEqual([1]);
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(pageNumbers(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(pageNumbers(10, 10)).toEqual([1, "…", 9, 10]);
  });
});

describe("countByTopic", () => {
  it("cuenta las palabras de cada tema", () => {
    const counts = countByTopic(groups);
    expect(counts.get("fruits")).toBe(2);
    expect(counts.get("house")).toBe(2);
    expect(counts.get("dining")).toBe(1);
  });
});

describe("parseFilters", () => {
  it("acepta lo válido e ignora el resto", () => {
    expect(
      parseFilters({
        nivel: "B2",
        tema: "fruits",
        tipo: "verb",
        letra: "A",
        q: "casa",
        fav: true,
        pagina: 3,
      }),
    ).toEqual({
      nivel: "B2",
      tema: "fruits",
      tipo: "verb",
      letra: "A",
      q: "casa",
      fav: true,
      pagina: 3,
    });
    expect(
      parseFilters({ nivel: "Z9", tipo: "cosa", q: "", tema: 3, fav: "no", pagina: 1 }),
    ).toEqual({
      nivel: undefined,
      tema: undefined,
      tipo: undefined,
      letra: undefined,
      q: undefined,
      fav: undefined,
      pagina: undefined,
    });
  });

  it("wordFilters quita la página", () => {
    expect(wordFilters({ nivel: "A1", pagina: 4 })).toEqual({ nivel: "A1" });
  });
});

describe("parsePracticeSearch", () => {
  it("una lista o, con vocabulario=true, los filtros de la tabla (sin la página)", () => {
    expect(parsePracticeSearch({ lista: "vocabulary/fruits" })).toEqual({
      lista: "vocabulary/fruits",
    });
    const filtered = parsePracticeSearch({ vocabulario: true, nivel: "C1", pagina: 2 });
    expect(filtered).toMatchObject({ vocabulario: true, nivel: "C1" });
    expect(filtered.pagina).toBeUndefined();
    // Sin vocabulario=true los filtros se ignoran
    expect(parsePracticeSearch({ nivel: "C1" })).toEqual({ lista: undefined });
  });
});

describe("wordType", () => {
  it("agrupa los verbos y las expresiones; el resto va a «other»", () => {
    expect(wordType("phrasal verb")).toBe("verb");
    expect(wordType("modal verb")).toBe("verb");
    expect(wordType("idiom")).toBe("phrase");
    expect(wordType("noun")).toBe("noun");
    expect(wordType("pronoun")).toBe("other");
  });
});

describe("wordKeys y fold", () => {
  it("quita «to», paréntesis y separa variantes", () => {
    expect(wordKeys("Lorry (UK) / truck (US)")).toEqual(["lorry", "truck"]);
    expect(wordKeys("To get up")).toEqual(["get up"]);
    expect(wordKeys("Albania – Albanian")).toEqual(["albania", "albanian"]);
    expect(wordKeys("To drive / go to work")).toEqual(["drive", "go to work"]);
  });

  it("unifica el apóstrofo, quita el paréntesis inicial y no parte palabras con guion", () => {
    expect(wordKeys("don’t like")).toEqual(["don't like"]);
    expect(wordKeys("(too) many")).toEqual(["many"]);
    expect(wordKeys("T-shirt")).toEqual(["t-shirt"]);
  });

  it("fold quita tildes y diéresis", () => {
    expect(fold("Pingüino Árbol")).toBe("pinguino arbol");
  });
});
