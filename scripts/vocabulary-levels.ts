// Nivel de cada palabra de las listas por temas (docs/PLAN.md F17c V5).
// Uso: npx tsx scripts/vocabulary-levels.ts [--force]
//
// 1. Si la palabra sale en una lista de Face2Face (Starter A1, Elementary A2,
//    Intermediate B1), su nivel es el del libro: está verificado.
// 2. Si no, su frecuencia de uso (Zipf de wordfreq), por el puesto que ocupa en el inglés,
//    como la Oxford 3000/5000: A1 las 1000 más comunes, A2 hasta la 3000, B1 hasta la 5000,
//    B2 hasta la 10 000 y C1 el resto. Si la entrada tiene variantes (lorry / truck), cuenta
//    la más común.
//
// La frecuencia la calcula scripts/word-zipf.py: si faltan palabras, este script escribe
// .face2face/zipf-input.json y pide ejecutarlo. Sin --force no cambia niveles ya puestos.
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Level, Word, WordList } from "@/content/schema";
import { wordKeys } from "@/features/vocabulary/logic";

const DIR = "src/content/wordlists/vocabulary";
const ZIPF_IN = ".face2face/zipf-input.json";
const ZIPF = ".face2face/zipf.json";

// Zipf de la palabra que ocupa cada puesto en wordfreq (en, 2026): 1000 → 5,03 (response),
// 3000 → 4,50 (graduate), 5000 → 4,22, 10 000 → 3,77 (biting)
const BANDS: [number, Level][] = [
  [5.0, "A1"],
  [4.5, "A2"],
  [4.2, "B1"],
  [3.8, "B2"],
];
const ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const byFrequency = (zipf: number): Level => BANDS.find(([min]) => zipf >= min)?.[1] ?? "C1";
const easier = (a: Level | undefined, b: Level) =>
  a && ORDER.indexOf(a) <= ORDER.indexOf(b) ? a : b;

const force = process.argv.includes("--force");
// Recursivo: hay sublistas (places-in-the-city-vocabulary/the-airport-vocabulary.json)
const files = (await readdir(DIR, { recursive: true })).filter((f) => f.endsWith(".json")).sort();
const lists = await Promise.all(
  files.map(async (f) => ({
    file: path.join(DIR, f),
    list: JSON.parse(await readFile(path.join(DIR, f), "utf8")) as WordList,
  })),
);
const words = (list: WordList) => list.groups.flatMap((g) => g.items);

// Nivel del libro de cada forma (la más fácil si sale en dos libros)
const book = new Map<string, Level>();
for (const { list } of lists)
  if (list.source === "face2face" && list.level)
    for (const w of words(list))
      for (const k of wordKeys(w.en)) book.set(k, easier(book.get(k), list.level));

const topics = lists.filter(({ list }) => list.source !== "face2face");
const zipf: Record<string, number> = existsSync(ZIPF)
  ? (JSON.parse(await readFile(ZIPF, "utf8")) as Record<string, number>)
  : {};
const missing = new Set(
  topics.flatMap(({ list }) =>
    words(list).flatMap((w) => wordKeys(w.en).filter((k) => !book.has(k) && !(k in zipf))),
  ),
);
if (missing.size > 0) {
  await writeFile(ZIPF_IN, JSON.stringify([...missing].sort(), null, 1) + "\n");
  console.log(`Faltan ${missing.size} frecuencias: ejecuta scripts/word-zipf.py y repite.`);
  process.exit(1);
}

function levelOf(w: Word): { level: Level; from: "libro" | "frecuencia" } {
  const keys = wordKeys(w.en);
  const fromBook = keys.reduce<Level | undefined>(
    (best, k) => (book.has(k) ? easier(best, book.get(k)!) : best),
    undefined,
  );
  if (fromBook) return { level: fromBook, from: "libro" };
  return { level: byFrequency(Math.max(...keys.map((k) => zipf[k] ?? 0))), from: "frecuencia" };
}

const total: Record<string, number> = {};
let fromBook = 0;
let fromFrequency = 0;
for (const { file, list } of topics) {
  for (const g of list.groups)
    g.items = g.items.map((w) => {
      if (w.level && !force) return w;
      const { level, from } = levelOf(w);
      if (from === "libro") fromBook++;
      else fromFrequency++;
      total[level] = (total[level] ?? 0) + 1;
      // `level` justo detrás de en/es, para que el JSON se lea bien
      const { en, es, ...rest } = w;
      return { en, ...(es !== undefined && { es }), level, ...rest };
    });
  await writeFile(file, JSON.stringify(list, null, 2) + "\n");
}
console.log(
  `${fromBook + fromFrequency} palabras: ${fromBook} por el libro, ${fromFrequency} por frecuencia`,
);
console.log(ORDER.map((l) => `${l} ${total[l] ?? 0}`).join(" · "));
