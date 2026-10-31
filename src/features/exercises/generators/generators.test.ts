import { describe, expect, it } from "vitest";
import { irregularVerbs } from "@/content/data/irregular-verbs";
import { TENSES } from "@/content/data/tense-index";
import { ExerciseSet } from "../schema";
import { checkItem } from "../check";
import { solutionSentence } from "../solution";
import { generateIrregularSet } from "./irregular-verbs";
import { generateTenseSet } from "./tenses";

describe("generateTenseSet", () => {
  it.each(TENSES.map((t) => [t.id, t] as const))(
    "%s: genera un set válido según el esquema",
    (_, tense) => {
      for (const seed of ["a", "b", "c"]) {
        const set = generateTenseSet(tense, seed);
        expect(ExerciseSet.safeParse(set).success).toBe(true);
        expect(set.items).toHaveLength(8);
      }
    },
  );

  it("la misma semilla da el mismo set y otra semilla, otro", () => {
    const tense = TENSES[1];
    if (!tense) throw new Error("sin tiempos");
    expect(generateTenseSet(tense, "x")).toEqual(generateTenseSet(tense, "x"));
    expect(generateTenseSet(tense, "x")).not.toEqual(generateTenseSet(tense, "y"));
  });

  it("la solución de cada ítem se corrige como correcta", () => {
    for (const tense of TENSES) {
      for (const item of generateTenseSet(tense, "seed").items) {
        // Respuesta "perfecta" construida a partir de la solución
        if (item.type === "transform")
          expect(checkItem(item, { type: "transform", text: item.answers[0] ?? "" }).status).toBe(
            "correct",
          );
        if (item.type === "multiple-choice") {
          expect(checkItem(item, { type: "multiple-choice", choice: 0 }).status).toBe("correct");
          // Las opciones no se repiten y hay al menos un distractor
          expect(new Set(item.options).size).toBe(item.options.length);
          expect(item.options.length).toBeGreaterThan(1);
        }
        if (item.type === "word-order")
          expect(item.distractors?.some((d) => item.answers[0]?.split(" ").includes(d))).toBe(
            false,
          );
        // No queda ningún hueco sin rellenar en la solución
        expect(solutionSentence(item)).not.toContain("___");
      }
    }
  });

  it("la pregunta de presente simple usa does con he/she", () => {
    const tense = TENSES.find((t) => t.id === "simple-present");
    if (!tense) throw new Error("falta simple-present");
    const all = generateTenseSet(tense, "q").items.flatMap((item) =>
      item.type === "transform" ? item.answers : [],
    );
    for (const answer of all) expect(answer).not.toMatch(/^Do (he|she)\b|^(He|She) do not/);
  });
});

describe("generateIrregularSet", () => {
  it("genera tablas y opción múltiple válidas", () => {
    const set = generateIrregularSet("s");
    expect(ExerciseSet.safeParse(set).success).toBe(true);
    expect(set.items.map((i) => i.type)).toEqual([
      "table-fill",
      "multiple-choice",
      "multiple-choice",
      "multiple-choice",
      "multiple-choice",
      "table-fill",
    ]);
  });

  it("ningún distractor es una forma válida del verbo", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      for (const item of generateIrregularSet(seed).items) {
        if (item.type !== "multiple-choice") continue;
        const base = item.prompt.match(/"(.+)"/)?.[1];
        const verb = irregularVerbs.find((v) => v.base === base);
        if (!verb) throw new Error(`verbo desconocido: ${base}`);
        const valid = item.prompt.startsWith("Past simple") ? verb.past : verb.participle;
        for (const option of item.options.slice(1)) expect(valid).not.toContain(option);
      }
    }
  });

  it("las tablas aceptan todas las variantes de cada forma (learnt / learned)", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      for (const item of generateIrregularSet(seed).items) {
        if (item.type !== "table-fill") continue;
        for (const row of item.rows) {
          const verb = irregularVerbs.find((v) => row.header.startsWith(`${v.base} (`));
          if (!verb) throw new Error(`fila desconocida: ${row.header}`);
          expect(row.cells).toEqual([
            { answers: [...verb.past] },
            { answers: [...verb.participle] },
          ]);
        }
        const values = item.rows.flatMap((row) =>
          row.cells.map((cell) => (typeof cell === "string" ? "" : (cell.answers.at(-1) ?? ""))),
        );
        expect(checkItem(item, { type: "table-fill", values }).status).toBe("correct");
      }
    }
  });
});
