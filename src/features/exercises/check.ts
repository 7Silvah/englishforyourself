// Corrección de respuestas (docs/PLAN.md §7.3). Todo lo que decide si una respuesta
// está bien pasa por aquí; los componentes solo muestran el resultado.
import { seededShuffle } from "@/lib/random";
import type { ExerciseItem, ExerciseType } from "./schema";

export type { ExerciseItem, ExerciseType };

export type Status = "correct" | "almost" | "wrong";

/** Resultado de un ítem. "parts" detalla cada hueco, pareja o paso cuando hay varios. */
export type CheckResult = { status: Status; parts?: Status[] };

/** Respuesta del estudiante, con la misma "type" que el ítem */
export type ItemResponse =
  | { type: "fill-blank"; values: string[] }
  | { type: "multiple-choice"; choice: number | null }
  | { type: "true-false"; choice: boolean | null }
  | { type: "word-order"; tokens: number[] } // índices de wordOrderTokens(), en el orden elegido
  | { type: "transform"; text: string }
  | { type: "error-correction"; token: number | null; text: string }
  | { type: "match"; pairs: (number | null)[] } // por cada elemento de la izquierda, el de la derecha elegido
  | { type: "categorize"; placed: (number | null)[] } // por cada palabra (categorizeItems), su categoría
  | { type: "translate"; text: string; tokens: number[] } // text si se escribe; tokens si hay wordBank
  | { type: "dictation"; text: string }
  | { type: "table-fill"; values: string[] } // un valor por hueco (tableBlanks), en orden de lectura
  | { type: "listen-choose"; choice: number | null };

export type ItemOf<T extends ExerciseType> = Extract<ExerciseItem, { type: T }>;
export type ResponseOf<T extends ExerciseType> = Extract<ItemResponse, { type: T }>;

/** Ítems que necesitan la voz del navegador: si no hay voces en inglés, se saltan */
export function needsAudio(item: ExerciseItem): boolean {
  return item.type === "dictation" || item.type === "listen-choose";
}

export function emptyResponse(item: ExerciseItem): ItemResponse {
  switch (item.type) {
    case "fill-blank":
      return { type: item.type, values: item.blanks.map(() => "") };
    case "multiple-choice":
    case "listen-choose":
      return { type: item.type, choice: null };
    case "true-false":
      return { type: item.type, choice: null };
    case "word-order":
      return { type: item.type, tokens: [] };
    case "transform":
    case "dictation":
      return { type: item.type, text: "" };
    case "error-correction":
      return { type: item.type, token: null, text: "" };
    case "match":
      return { type: item.type, pairs: item.pairs.map(() => null) };
    case "categorize":
      return { type: item.type, placed: categorizeItems(item).map(() => null) };
    case "translate":
      return { type: item.type, text: "", tokens: [] };
    case "table-fill":
      return { type: item.type, values: tableBlanks(item).map(() => "") };
  }
}

// ---------- Texto ----------

/** Quita lo que no cambia el significado: espacios, comillas tipográficas, mayúsculas y el punto final */
export function normalize(text: string): string {
  return text
    .replace(/[‘’ʼ´`]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ ([.,!?;:])/g, "$1")
    .trim()
    .replace(/[.!?]+$/, "")
    .trim();
}

// Contracciones con una sola lectura posible. 's (is/has) y 'd (had/would) son
// ambiguas: solo valen si el ejercicio las incluye en "answers".
const CONTRACTIONS: [RegExp, string][] = [
  [/\bwon't\b/g, "will not"],
  [/\bshan't\b/g, "shall not"],
  [/\bcan't\b/g, "can not"],
  [/\bcannot\b/g, "can not"],
  [/n't\b/g, " not"],
  [/\bi'm\b/g, "i am"],
  [/'re\b/g, " are"],
  [/'ve\b/g, " have"],
  [/'ll\b/g, " will"],
];

/** Forma canónica para comparar: normalizada y con las contracciones desarrolladas */
export function canonical(text: string): string {
  let result = normalize(text);
  for (const [pattern, full] of CONTRACTIONS) result = result.replace(pattern, full);
  return result.replace(/\s+/g, " ").trim();
}

/** Distancia de edición contando también el intercambio de dos letras seguidas (teh → the) */
export function editDistance(a: string, b: string): number {
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    const row: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      if (i === 0) {
        row.push(j);
        continue;
      }
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(
        (rows[i - 1]?.[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + 1,
        (rows[i - 1]?.[j - 1] ?? 0) + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        best = Math.min(best, (rows[i - 2]?.[j - 2] ?? 0) + 1);
      row.push(best);
    }
    rows.push(row);
  }
  return rows[a.length]?.[b.length] ?? 0;
}

// Una falta de ortografía es una sola letra de diferencia, pero no al final de una
// palabra: "work" en vez de "works" o "play" en vez de "played" son errores de
// gramática, justo lo que el ejercicio quiere practicar.
function isTypo(input: string, expected: string): boolean {
  if (Math.max(input.length, expected.length) < 5) return false;
  if (editDistance(input, expected) !== 1) return false;
  let i = 0;
  while (i < input.length && input[i] === expected[i]) i++;
  const longer = input.length >= expected.length ? input : expected;
  const next = longer[i + 1];
  return next !== undefined && next !== " ";
}

/** Compara un texto escrito con las respuestas válidas */
export function checkText(
  input: string,
  answers: readonly string[],
  { allowAlmost = true }: { allowAlmost?: boolean } = {},
): Status {
  const got = canonical(input);
  if (!got) return "wrong";
  if (answers.some((answer) => canonical(answer) === got)) return "correct";
  if (!allowAlmost) return "wrong";
  // También contra la forma sin desarrollar, para detectar "dont" frente a "don't"
  const forms = [got, normalize(input)];
  const typo = answers.some((answer) =>
    [canonical(answer), normalize(answer)].some((valid) =>
      forms.some((form) => isTypo(form, valid)),
    ),
  );
  return typo ? "almost" : "wrong";
}

/** Un ítem con varias partes: está bien si todas lo están; mal si alguna está mal */
export function combine(parts: readonly Status[]): Status {
  if (parts.every((p) => p === "correct")) return "correct";
  if (parts.some((p) => p === "wrong")) return "wrong";
  return "almost";
}

// ---------- Ayudas por tipo ----------

/** Índices de 0 a n-1 barajados con semilla */
function shuffledIndices(n: number, seed: string): number[] {
  return seededShuffle(
    Array.from({ length: n }, (_, i) => i),
    seed,
  );
}

/** Barajado que nunca deja la lista en su orden original (sería la solución) */
function shuffledNotSolved(n: number, seed: string): number[] {
  const shuffled = shuffledIndices(n, seed);
  return shuffled.every((v, i) => v === i) ? shuffled.reverse() : shuffled;
}

/** Fichas de un word-order: las palabras de la primera respuesta más los distractores */
export function wordOrderTokens(item: ItemOf<"word-order">): string[] {
  const words = (item.answers[0] ?? "").split(/\s+/).filter(Boolean);
  return [...words, ...(item.distractors ?? [])];
}

/** Orden en que se muestran las fichas: barajado, pero nunca ya resuelto */
export function wordOrderDisplay(item: ItemOf<"word-order">, seed: string): number[] {
  return shuffledNotSolved(wordOrderTokens(item).length, seed);
}

/** Orden en que se muestran las opciones (multiple-choice, listen-choose) */
export function choiceDisplay(item: { options: readonly string[] }, seed: string): number[] {
  return shuffledIndices(item.options.length, seed);
}

/** Palabras de la frase de un error-correction */
export function sentenceTokens(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

/** Índices de las palabras que forman el fragmento incorrecto */
export function wrongTokenIndices(item: ItemOf<"error-correction">): number[] {
  const start = item.sentence.indexOf(item.wrong);
  if (start < 0) return [];
  const end = start + item.wrong.length;
  const result: number[] = [];
  let offset = 0;
  sentenceTokens(item.sentence).forEach((token, i) => {
    const at = item.sentence.indexOf(token, offset);
    offset = at + token.length;
    if (at < end && offset > start) result.push(i);
  });
  return result;
}

/** Orden en que se muestra la columna derecha de un match (la izquierda va en orden) */
export function matchDisplay(item: ItemOf<"match">, seed: string): number[] {
  return shuffledNotSolved(item.pairs.length, seed);
}

/** Todas las palabras de un categorize, cada una con su categoría correcta */
export function categorizeItems(item: ItemOf<"categorize">): { text: string; category: number }[] {
  return item.categories.flatMap((c, category) => c.items.map((text) => ({ text, category })));
}

export function categorizeDisplay(item: ItemOf<"categorize">, seed: string): number[] {
  return shuffledIndices(categorizeItems(item).length, seed);
}

/** Huecos de un table-fill, en orden de lectura (fila a fila) */
export function tableBlanks(
  item: ItemOf<"table-fill">,
): { row: number; col: number; answers: string[] }[] {
  return item.rows.flatMap((r, row) =>
    r.cells.flatMap((cell, col) =>
      typeof cell === "string" ? [] : [{ row, col, answers: cell.answers }],
    ),
  );
}

/** Orden de las fichas del banco de palabras de un translate */
export function translateDisplay(item: ItemOf<"translate">, seed: string): number[] {
  return shuffledNotSolved(item.wordBank?.length ?? 0, seed);
}

// ---------- Corrección de un ítem ----------

const right = (ok: boolean): Status => (ok ? "correct" : "wrong");

export function checkItem(item: ExerciseItem, response: ItemResponse): CheckResult {
  switch (item.type) {
    case "fill-blank": {
      const values = response.type === "fill-blank" ? response.values : [];
      const parts = item.blanks.map((blank, i) => checkText(values[i] ?? "", blank.answers));
      return { status: combine(parts), parts };
    }
    case "multiple-choice":
      return {
        status: right(response.type === "multiple-choice" && response.choice === item.answer),
      };
    case "listen-choose":
      return {
        status: right(response.type === "listen-choose" && response.choice === item.answer),
      };
    case "true-false":
      return { status: right(response.type === "true-false" && response.choice === item.answer) };
    case "word-order": {
      if (response.type !== "word-order") return { status: "wrong" };
      const tokens = wordOrderTokens(item);
      const sentence = response.tokens.map((i) => tokens[i] ?? "").join(" ");
      return { status: checkText(sentence, item.answers, { allowAlmost: false }) };
    }
    case "transform":
      return {
        status: response.type === "transform" ? checkText(response.text, item.answers) : "wrong",
      };
    case "error-correction": {
      if (response.type !== "error-correction") return { status: "wrong" };
      const found = right(
        response.token !== null && wrongTokenIndices(item).includes(response.token),
      );
      const fixed = checkText(response.text, item.answers);
      return { status: combine([found, fixed]), parts: [found, fixed] };
    }
    case "match": {
      const pairs = response.type === "match" ? response.pairs : [];
      const parts = item.pairs.map((_, i) => right(pairs[i] === i));
      return { status: combine(parts), parts };
    }
    case "categorize": {
      const placed = response.type === "categorize" ? response.placed : [];
      const parts = categorizeItems(item).map((w, i) => right(placed[i] === w.category));
      return { status: combine(parts), parts };
    }
    case "translate": {
      if (response.type !== "translate") return { status: "wrong" };
      // Con banco de palabras se responde con fichas: no hay faltas de ortografía posibles
      if (item.wordBank) {
        const sentence = response.tokens.map((i) => item.wordBank?.[i] ?? "").join(" ");
        return { status: checkText(sentence, item.answers, { allowAlmost: false }) };
      }
      return { status: checkText(response.text, item.answers) };
    }
    case "dictation":
      return {
        status:
          response.type === "dictation"
            ? checkText(response.text, [item.text, ...(item.answers ?? [])])
            : "wrong",
      };
    case "table-fill": {
      const values = response.type === "table-fill" ? response.values : [];
      const parts = tableBlanks(item).map((blank, i) => checkText(values[i] ?? "", blank.answers));
      return { status: combine(parts), parts };
    }
  }
}

/** ¿Ha respondido algo? Sirve para no corregir una respuesta vacía por accidente. */
export function hasAnswer(response: ItemResponse): boolean {
  switch (response.type) {
    case "fill-blank":
    case "table-fill":
      return response.values.some((v) => v.trim() !== "");
    case "multiple-choice":
    case "true-false":
    case "listen-choose":
      return response.choice !== null;
    case "word-order":
      return response.tokens.length > 0;
    case "transform":
    case "dictation":
      return response.text.trim() !== "";
    case "error-correction":
      return response.token !== null;
    case "match":
      return response.pairs.some((p) => p !== null);
    case "categorize":
      return response.placed.some((p) => p !== null);
    case "translate":
      return response.text.trim() !== "" || response.tokens.length > 0;
  }
}
