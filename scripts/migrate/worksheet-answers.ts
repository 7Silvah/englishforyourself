// Convierte la clave de respuestas de los worksheets en respuestas por hueco.
//
//   "will / ‘ll be flying"                  → ["will be flying", "’ll be flying"]
//   "won’t / will not / ‘ll not be working" → ["won’t be working", "will not be working", "’ll not be working"]
//   "finish – will watch" (dos huecos)      → [["finish"], ["will watch"]]
//   "had / ‘d left" con dos huecos          → [["had", "’d"], ["left"]]   (… ___ already ___ …)

// En los PDF el apóstrofo de las contracciones a veces es ‘ (comilla de apertura)
export function fixQuotes(s: string): string {
  return s.replace(/[‘`]/g, "’").replace(/'/g, "’");
}

type Split = { alternatives: string[]; rest: string };

// "won’t / will not / ‘ll not be travelling" → alternativas + resto común.
// La última alternativa ocupa 1 palabra, o 2 si la segunda es "not".
export function splitAlternatives(phrase: string): Split {
  const segments = phrase.split(/\s*\/\s*/).map((s) => s.trim());
  if (segments.length === 1) return { alternatives: [phrase.trim()], rest: "" };
  const lastWords = (segments.at(-1) ?? "").split(/\s+/);
  const altLength = lastWords[1]?.toLowerCase() === "not" ? 2 : 1;
  return {
    alternatives: [...segments.slice(0, -1), lastWords.slice(0, altLength).join(" ")],
    rest: lastWords.slice(altLength).join(" "),
  };
}

export function expandAlternatives(phrase: string): string[] {
  const { alternatives, rest } = splitAlternatives(phrase);
  return alternatives.map((a) => (rest ? `${a} ${rest}` : a));
}

// "Won’t" → "won’t" cuando el hueco no abre la frase (salvo "I", "I’m"…)
export function fixCase(answer: string, blankStartsSentence: boolean): string {
  if (blankStartsSentence || /^I(\b|’)/.test(answer)) return answer;
  return answer.charAt(0).toLowerCase() + answer.slice(1);
}

// Respuestas por hueco a partir de la clave y del número de huecos de la frase
export function answersPerBlank(key: string, blankCount: number): string[][] | null {
  const parts = fixQuotes(key)
    .split(/\s[–-]\s/)
    .map((p) => p.trim());
  if (parts.length === blankCount) return parts.map(expandAlternatives);
  // "the bus ___ already ___ (to leave)" → "had / ’d left"
  if (blankCount === 2 && parts.length === 1 && parts[0]) {
    const { alternatives, rest } = splitAlternatives(parts[0]);
    if (rest) return [alternatives, [rest]];
  }
  return null;
}

// Las contracciones ambiguas (’d = had/would, ’s = is/has) no las deduce el corrector:
// tienen que estar en la lista. La clave original a veces las da y a veces no.
const AMBIGUOUS: [RegExp, string][] = [
  [/^(had|would)\b/i, "’d"],
  [/^(is|has)\b/i, "’s"],
];

export function withAmbiguousContractions(
  answers: string[],
  blankStartsSentence: boolean,
): string[] {
  if (blankStartsSentence) return answers; // "’d…" no puede abrir una frase
  const out = new Set(answers);
  for (const answer of answers)
    for (const [re, short] of AMBIGUOUS) if (re.test(answer)) out.add(answer.replace(re, short));
  return [...out];
}

// Variantes británicas/estadounidenses de palabras que aparecen en las respuestas.
// Lista cerrada a propósito: generar variantes con reglas produce palabras inventadas.
const SPELLING_PAIRS: [string, string][] = [
  ["travelled", "traveled"],
  ["travelling", "traveling"],
  ["organised", "organized"],
  ["practising", "practicing"],
  ["practised", "practiced"],
  ["favourite", "favorite"],
  ["cancelled", "canceled"],
  ["realised", "realized"],
];
const SPELLING = new Map(
  SPELLING_PAIRS.flatMap(([a, b]) => [
    [a, b],
    [b, a],
  ]),
);

export function withSpellingVariants(answers: string[]): string[] {
  const out = new Set(answers);
  for (const answer of answers) {
    const swapped = answer.replace(/[a-z]+/gi, (w) => SPELLING.get(w.toLowerCase()) ?? w);
    out.add(swapped);
  }
  return [...out];
}
