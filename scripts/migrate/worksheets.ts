// Migración: worksheets PDF (legacy/assets/pdf) → src/content/exercises/worksheets/<id>.json
// Uso: npm run migrate:worksheets
// Es idempotente: se puede ejecutar de nuevo y revisar el resultado con git diff.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ExerciseSet } from "@/features/exercises/schema";
import {
  answersPerBlank,
  fixCase,
  fixQuotes,
  withAmbiguousContractions,
  withSpellingVariants,
} from "./worksheet-answers";
import { worksheetMap } from "./worksheet-map";
import { parseWorksheet, pdfText } from "./worksheet-parse";

const SOURCE_DIR = "legacy/assets/pdf";
const OUT_DIR = "src/content/exercises/worksheets";

// Erratas evidentes de los PDF originales, corregidas a mano tras revisar los 350 ítems.
// Clave: "<id>#<número de ítem>"
const FIXES: Record<string, { text?: [string, string]; answer?: string }> = {
  "present-perfect-continuous#10": { answer: "have / ‘ve been learning" }, // faltaba "been"
  "past-perfect-continuous#7": { text: ["feel asleep", "fell asleep"] },
  "past-perfect-continuous-negative#6": { text: ["had worsen", "had worsened"] },
  "future-perfect#1": { text: ["arrive to the", "arrive at the"] },
};

function cleanSentence(text: string): string {
  let s = fixQuotes(text)
    .replace(/_{3,}/g, " ___ ") // también separa "You___" → "You ___"
    .replace(/\s+/g, " ")
    .replace(/ ([.,?!])/g, "$1")
    .trim();
  s = s.replace(/:$/, "."); // errata: una frase terminaba en ":"
  if (!/[.?!)]$/.test(s)) s += ".";
  return s;
}

const files = (await readdir(SOURCE_DIR)).filter((f) => f.endsWith(".pdf")).sort();
await mkdir(OUT_DIR, { recursive: true });

const problems: string[] = [];
const applied: string[] = [];
let itemTotal = 0;

for (const file of files) {
  const info = worksheetMap[file];
  if (!info) {
    problems.push(`${file}: no está en worksheet-map.ts`);
    continue;
  }
  const parsed = parseWorksheet(await pdfText(path.join(SOURCE_DIR, file)));
  problems.push(...parsed.warnings.map((w) => `${file}: ${w}`));

  const items = parsed.items.map(({ n, text, answer }) => {
    const fix = FIXES[`${info.id}#${n}`];
    if (fix) applied.push(`${info.id} #${n}`);
    const rawText = fix?.text ? text.replace(fix.text[0], fix.text[1]) : text;
    const key = fix?.answer ?? answer;

    const sentence = cleanSentence(rawText);
    const blankCount = sentence.split("___").length - 1;
    const perBlank = answersPerBlank(key, blankCount);
    if (!perBlank)
      problems.push(`${file} #${n}: no se pudo repartir «${key}» en ${blankCount} huecos`);
    const blanks = (perBlank ?? [[key]]).map((answers, i) => {
      const atStart = i === 0 && sentence.startsWith("___");
      const cased = answers.map((a) => fixCase(a, atStart));
      return { answers: withSpellingVariants(withAmbiguousContractions(cased, atStart)) };
    });
    return { id: String(n), type: "fill-blank" as const, text: sentence, blanks };
  });
  itemTotal += items.length;

  const set = {
    title: info.title,
    titleEs: info.titleEs,
    instruction: fixQuotes(parsed.instruction),
    instructionEs: info.instructionEs,
    source: "worksheet" as const,
    level: info.level,
    lessons: info.lessons,
    topics: info.topics,
    reviewed: false,
    legacyPath: `assets/pdf/${file}`,
    items,
  };

  // Validar con el mismo esquema que usa la app antes de escribir
  const result = ExerciseSet.safeParse(set);
  if (!result.success) problems.push(`${file}: ${result.error.message}`);

  await writeFile(path.join(OUT_DIR, `${info.id}.json`), `${JSON.stringify(set, null, 2)}\n`);
}

console.log(`${files.length} worksheets → ${OUT_DIR} (${itemTotal} ítems)`);
console.log(`Erratas corregidas (${applied.length}): ${applied.join(", ")}`);
const missingFixes = Object.keys(FIXES).filter((k) => !applied.includes(k.replace("#", " #")));
if (missingFixes.length) problems.push(`correcciones sin aplicar: ${missingFixes.join(", ")}`);
if (problems.length) {
  console.log(`\n${problems.length} problemas:`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
