// Cómo se muestra la solución de un ítem: en la corrección, en el resultado y en la clave impresa.
import { es } from "@/i18n/es";
import {
  categorizeItems,
  sentenceTokens,
  tableBlanks,
  wordOrderTokens,
  type ExerciseItem,
  type ItemResponse,
} from "./check";

const BLANK = "___";

/** Trozos de texto alrededor de los huecos: "I ___ here." → ["I ", " here."] */
export function splitBlanks(text: string): string[] {
  return text.split(BLANK);
}

// La pista que sigue al hueco, "(to live)" o "(not / bring)", sobra en la frase resuelta
function fill(text: string, values: readonly string[]): string {
  return splitBlanks(text)
    .map((part, i) =>
      i === 0 ? part : `${values[i - 1] ?? BLANK}${part.replace(/^\s*\([^)]*\)/, "")}`,
    )
    .join("");
}

const list = (parts: readonly string[]) => parts.join(" · ");

/** Categorías con sus palabras: "a: apple, egg · an: …" */
function categorized(
  item: Extract<ExerciseItem, { type: "categorize" }>,
  pick: (index: number) => number | null,
): string {
  const words = categorizeItems(item);
  return list(
    item.categories.map(
      (c, ci) =>
        `${c.label}: ${words
          .filter((_, i) => pick(i) === ci)
          .map((w) => w.text)
          .join(", ")}`,
    ),
  );
}

/** La solución en inglés (se muestra y, si tiene sentido, se puede escuchar) */
export function solutionSentence(item: ExerciseItem): string {
  switch (item.type) {
    case "fill-blank":
      return fill(
        item.text,
        item.blanks.map((b) => b.answers[0] ?? ""),
      );
    case "multiple-choice": {
      const option = item.options[item.answer] ?? "";
      return item.prompt.includes(BLANK) ? fill(item.prompt, [option]) : option;
    }
    case "listen-choose":
      return item.options[item.answer] ?? "";
    case "true-false":
      return item.statement;
    case "word-order":
    case "transform":
    case "translate":
      return item.answers[0] ?? "";
    case "error-correction":
      return item.sentence.replace(item.wrong, item.answers[0] ?? item.wrong);
    case "dictation":
      return item.text;
    case "match":
      return list(item.pairs.map((p) => `${p.left} = ${p.right}`));
    case "categorize":
      return categorized(item, (i) => categorizeItems(item)[i]?.category ?? null);
    case "table-fill":
      return tableBlanks(item)
        .map((b) => b.answers[0] ?? "")
        .join(" … ");
  }
}

/** Lo que se enseña como solución. En verdadero/falso, la frase con su veredicto. */
export function solutionText(item: ExerciseItem): string {
  return item.type === "true-false"
    ? `${item.statement} → ${answerKey(item)}`
    : solutionSentence(item);
}

/** ¿Tiene sentido escuchar la solución? No, si es una frase incorrecta o una lista. */
export function canListen(item: ExerciseItem): boolean {
  if (item.type === "dictation" || item.type === "listen-choose") return true;
  if (item.type === "match" || item.type === "categorize" || item.type === "table-fill")
    return false;
  return item.audio === true && !(item.type === "true-false" && !item.answer);
}

/** Respuesta corta para la clave: solo lo que había que escribir o elegir */
export function answerKey(item: ExerciseItem): string {
  switch (item.type) {
    case "fill-blank":
      return item.blanks.map((b) => b.answers[0] ?? "").join(" … ");
    case "multiple-choice":
    case "listen-choose":
      return item.options[item.answer] ?? "";
    case "true-false":
      return item.answer ? es.exercises.printPage.true : es.exercises.printPage.false;
    case "error-correction":
      return `${item.wrong} → ${item.answers[0] ?? ""}`;
    default:
      return solutionSentence(item);
  }
}

/** Lo que respondió el estudiante, como texto */
export function responseText(item: ExerciseItem, response: ItemResponse): string {
  switch (response.type) {
    case "fill-blank":
    case "table-fill":
      return response.values.map((v) => v.trim() || "…").join(" … ");
    case "multiple-choice":
    case "listen-choose":
      return (item.type === "multiple-choice" || item.type === "listen-choose") &&
        response.choice !== null
        ? (item.options[response.choice] ?? "")
        : "";
    case "true-false":
      return response.choice === null
        ? ""
        : response.choice
          ? es.exercises.types.trueFalse.true
          : es.exercises.types.trueFalse.false;
    case "word-order": {
      const tokens = item.type === "word-order" ? wordOrderTokens(item) : [];
      return response.tokens.map((i) => tokens[i] ?? "").join(" ");
    }
    case "transform":
    case "dictation":
      return response.text;
    case "translate":
      return item.type === "translate" && item.wordBank
        ? response.tokens.map((i) => item.wordBank?.[i] ?? "").join(" ")
        : response.text;
    case "error-correction": {
      const words = item.type === "error-correction" ? sentenceTokens(item.sentence) : [];
      const chosen = response.token === null ? "" : (words[response.token] ?? "");
      return chosen ? `${chosen} → ${response.text}` : "";
    }
    case "match":
      return item.type === "match"
        ? list(
            item.pairs.map((p, i) => {
              const chosen = response.pairs[i];
              return `${p.left} = ${chosen === null || chosen === undefined ? "…" : (item.pairs[chosen]?.right ?? "…")}`;
            }),
          )
        : "";
    case "categorize":
      return item.type === "categorize" ? categorized(item, (i) => response.placed[i] ?? null) : "";
  }
}
