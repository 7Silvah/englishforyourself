// Cómo se muestra la solución de un ítem: en la corrección, en el resultado y en la clave impresa.
import { es } from "@/i18n/es";
import { sentenceTokens, wordOrderTokens, type ItemResponse, type SupportedItem } from "./check";

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

/** La frase en inglés ya resuelta (se muestra y se puede escuchar) */
export function solutionSentence(item: SupportedItem): string {
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
    case "true-false":
      return item.statement;
    case "word-order":
    case "transform":
      return item.answers[0] ?? "";
    case "error-correction":
      return item.sentence.replace(item.wrong, item.answers[0] ?? item.wrong);
  }
}

/** Lo que se enseña como solución. En verdadero/falso, la frase con su veredicto. */
export function solutionText(item: SupportedItem): string {
  return item.type === "true-false"
    ? `${item.statement} → ${answerKey(item)}`
    : solutionSentence(item);
}

/** ¿Tiene sentido escuchar la solución? No, si es una frase incorrecta. */
export function canListen(item: SupportedItem): boolean {
  return item.audio === true && !(item.type === "true-false" && !item.answer);
}

/** Respuesta corta para la clave: solo lo que había que escribir o elegir */
export function answerKey(item: SupportedItem): string {
  switch (item.type) {
    case "fill-blank":
      return item.blanks.map((b) => b.answers[0] ?? "").join(" … ");
    case "multiple-choice":
      return item.options[item.answer] ?? "";
    case "true-false":
      return item.answer ? es.exercises.printPage.true : es.exercises.printPage.false;
    case "word-order":
    case "transform":
      return item.answers[0] ?? "";
    case "error-correction":
      return `${item.wrong} → ${item.answers[0] ?? ""}`;
  }
}

/** Lo que respondió el estudiante, como texto */
export function responseText(item: SupportedItem, response: ItemResponse): string {
  switch (response.type) {
    case "fill-blank":
      return response.values.map((v) => v.trim() || "…").join(" … ");
    case "multiple-choice":
      return item.type === "multiple-choice" && response.choice !== null
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
      return response.text;
    case "error-correction": {
      const words = item.type === "error-correction" ? sentenceTokens(item.sentence) : [];
      const chosen = response.token === null ? "" : (words[response.token] ?? "");
      return chosen ? `${chosen} → ${response.text}` : "";
    }
  }
}
