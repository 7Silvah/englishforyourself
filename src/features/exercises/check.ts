// Corrección de respuestas (docs/PLAN.md §7.3). Todo lo que decide si una respuesta
// está bien pasa por aquí; los componentes solo muestran el resultado.
import { seededShuffle } from "@/lib/random";
import type { ExerciseItem, ExerciseType } from "./schema";

export type Status = "correct" | "almost" | "wrong";

/** Resultado de un ítem. "parts" detalla cada hueco o paso cuando hay varios. */
export type CheckResult = { status: Status; parts?: Status[] };

/** Respuesta del estudiante, con la misma "type" que el ítem */
export type ItemResponse =
  | { type: "fill-blank"; values: string[] }
  | { type: "multiple-choice"; choice: number | null }
  | { type: "true-false"; choice: boolean | null }
  | { type: "word-order"; tokens: number[] } // índices de wordOrderTokens(), en el orden elegido
  | { type: "transform"; text: string }
  | { type: "error-correction"; token: number | null; text: string };

// Tipos que ya tienen componente (F5). El resto llega en F9.
export const SUPPORTED_TYPES = [
  "fill-blank",
  "multiple-choice",
  "true-false",
  "word-order",
  "transform",
  "error-correction",
] as const satisfies readonly ExerciseType[];

export type SupportedType = (typeof SUPPORTED_TYPES)[number];
export type ItemOf<T extends ExerciseType> = Extract<ExerciseItem, { type: T }>;
export type ResponseOf<T extends SupportedType> = Extract<ItemResponse, { type: T }>;
export type SupportedItem = ItemOf<SupportedType>;

export function isSupported(item: ExerciseItem): item is SupportedItem {
  return SUPPORTED_TYPES.some((type) => type === item.type);
}

export function emptyResponse(item: SupportedItem): ItemResponse {
  switch (item.type) {
    case "fill-blank":
      return { type: item.type, values: item.blanks.map(() => "") };
    case "multiple-choice":
      return { type: item.type, choice: null };
    case "true-false":
      return { type: item.type, choice: null };
    case "word-order":
      return { type: item.type, tokens: [] };
    case "transform":
      return { type: item.type, text: "" };
    case "error-correction":
      return { type: item.type, token: null, text: "" };
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

/** Fichas de un word-order: las palabras de la primera respuesta más los distractores */
export function wordOrderTokens(item: ItemOf<"word-order">): string[] {
  const words = (item.answers[0] ?? "").split(/\s+/).filter(Boolean);
  return [...words, ...(item.distractors ?? [])];
}

/** Orden en que se muestran las fichas: barajado, pero nunca ya resuelto */
export function wordOrderDisplay(item: ItemOf<"word-order">, seed: string): number[] {
  const indices = wordOrderTokens(item).map((_, i) => i);
  const shuffled = seededShuffle(indices, seed);
  return shuffled.every((n, i) => n === i) ? shuffled.reverse() : shuffled;
}

/** Orden en que se muestran las opciones de una pregunta de opción múltiple */
export function choiceDisplay(item: ItemOf<"multiple-choice">, seed: string): number[] {
  return seededShuffle(
    item.options.map((_, i) => i),
    seed,
  );
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

// ---------- Corrección de un ítem ----------

export function checkItem(item: SupportedItem, response: ItemResponse): CheckResult {
  switch (item.type) {
    case "fill-blank": {
      const values = response.type === "fill-blank" ? response.values : [];
      const parts = item.blanks.map((blank, i) => checkText(values[i] ?? "", blank.answers));
      return { status: combine(parts), parts };
    }
    case "multiple-choice":
      return {
        status:
          response.type === "multiple-choice" && response.choice === item.answer
            ? "correct"
            : "wrong",
      };
    case "true-false":
      return {
        status:
          response.type === "true-false" && response.choice === item.answer ? "correct" : "wrong",
      };
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
      const found =
        response.token !== null && wrongTokenIndices(item).includes(response.token)
          ? "correct"
          : "wrong";
      const fixed = checkText(response.text, item.answers);
      return { status: combine([found, fixed]), parts: [found, fixed] };
    }
  }
}

/** ¿Ha respondido algo? Sirve para no corregir una respuesta vacía por accidente. */
export function hasAnswer(response: ItemResponse): boolean {
  switch (response.type) {
    case "fill-blank":
      return response.values.some((v) => v.trim() !== "");
    case "multiple-choice":
    case "true-false":
      return response.choice !== null;
    case "word-order":
      return response.tokens.length > 0;
    case "transform":
      return response.text.trim() !== "";
    case "error-correction":
      return response.token !== null;
  }
}
