// Motor de conjugación: arma una frase en bloques (sujeto, auxiliar, verbo, complemento)
// para cualquier tiempo verbal del Tense Lab, en afirmativa, negativa o pregunta.
// Lo usan el constructor de frases del Tense Lab y los ejercicios generados.
import { getIrregularVerb } from "@/content/data/irregular-verbs";
import type { TenseId } from "@/content/data/tense-index";
import type { Block } from "@/content/data/tenses";
import type { BlockKind } from "@/components/lesson/tones";

export type Mood = "pos" | "neg" | "q";
export type Subject = "I" | "you" | "he" | "she" | "we" | "they";
export type Piece = { role: BlockKind; text: string };

// Sin "it": "It plays tennis" no tiene sentido con estos verbos
export const SUBJECTS: readonly Subject[] = ["I", "you", "he", "she", "we", "they"];

export type PracticeVerb = { base: string; object: string; es: string };

// Verbos con un complemento que funciona en todos los tiempos
export const PRACTICE_VERBS: readonly PracticeVerb[] = [
  { base: "play", object: "tennis", es: "jugar al tenis" },
  { base: "watch", object: "TV", es: "ver la tele" },
  { base: "study", object: "English", es: "estudiar inglés" },
  { base: "cook", object: "dinner", es: "hacer la cena" },
  { base: "read", object: "a book", es: "leer un libro" },
  { base: "write", object: "an email", es: "escribir un correo" },
  { base: "drink", object: "coffee", es: "tomar café" },
  { base: "eat", object: "breakfast", es: "desayunar" },
  { base: "drive", object: "to work", es: "ir en coche al trabajo" },
  { base: "make", object: "a cake", es: "hacer un pastel" },
  { base: "go", object: "to the gym", es: "ir al gimnasio" },
  { base: "swim", object: "in the sea", es: "nadar en el mar" },
];

const isThird = (s: Subject) => s === "he" || s === "she";

// ---------- Formas del verbo ----------

// Una sílaba con consonante + vocal + consonante dobla la última: run → running, stop → stopped
function doublesFinal(base: string): boolean {
  return /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(base);
}

export function thirdPerson(base: string): string {
  if (base === "have") return "has";
  if (/(s|sh|ch|x|z|o)$/.test(base)) return `${base}es`;
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ies`;
  return `${base}s`;
}

export function ingForm(base: string): string {
  if (base.endsWith("ie")) return `${base.slice(0, -2)}ying`;
  if (base.endsWith("e") && !base.endsWith("ee") && base !== "be") return `${base.slice(0, -1)}ing`;
  if (doublesFinal(base)) return `${base}${base.at(-1)}ing`;
  return `${base}ing`;
}

/** Pasado regular, aunque el verbo sea irregular (sirve para los distractores: "buyed") */
export function regularPast(base: string): string {
  if (base.endsWith("e")) return `${base}d`;
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
  if (doublesFinal(base)) return `${base}${base.at(-1)}ed`;
  return `${base}ed`;
}

export function pastForm(base: string): string {
  return getIrregularVerb(base)?.past[0] ?? regularPast(base);
}

export function participleForm(base: string): string {
  return getIrregularVerb(base)?.participle[0] ?? regularPast(base);
}

// ---------- Tiempos ----------

type VerbForm = "base" | "ing" | "pp";

type Spec =
  // Tiempos simples: el verbo cambia en afirmativa y usan do/does/did en negativa y pregunta
  | { kind: "simple"; time: "present" | "past" }
  // Tiempos con auxiliar: el primero depende del sujeto y es el que se niega o se adelanta
  | { kind: "aux"; first: (s: Subject) => string; rest: readonly string[]; form: VerbForm };

const bePresent = (s: Subject) => (s === "I" ? "am" : isThird(s) ? "is" : "are");
const bePast = (s: Subject) => (s === "I" || isThird(s) ? "was" : "were");
const have = (s: Subject) => (isThird(s) ? "has" : "have");
const fixed = (word: string) => () => word;

const SPECS: Record<TenseId, Spec> = {
  "simple-present": { kind: "simple", time: "present" },
  "present-continuous": { kind: "aux", first: bePresent, rest: [], form: "ing" },
  "present-perfect": { kind: "aux", first: have, rest: [], form: "pp" },
  "present-perfect-continuous": { kind: "aux", first: have, rest: ["been"], form: "ing" },
  "simple-past": { kind: "simple", time: "past" },
  "past-continuous": { kind: "aux", first: bePast, rest: [], form: "ing" },
  "past-perfect": { kind: "aux", first: fixed("had"), rest: [], form: "pp" },
  "past-perfect-continuous": { kind: "aux", first: fixed("had"), rest: ["been"], form: "ing" },
  "future-simple-will": { kind: "aux", first: fixed("will"), rest: [], form: "base" },
  "future-simple-going-to": { kind: "aux", first: bePresent, rest: ["going to"], form: "base" },
  "future-continuous": { kind: "aux", first: fixed("will"), rest: ["be"], form: "ing" },
  "future-perfect": { kind: "aux", first: fixed("will"), rest: ["have"], form: "pp" },
  "future-perfect-continuous": {
    kind: "aux",
    first: fixed("will"),
    rest: ["have", "been"],
    form: "ing",
  },
};

function verbIn(form: VerbForm, base: string): string {
  return form === "ing" ? ingForm(base) : form === "pp" ? participleForm(base) : base;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Auxiliares que puede llevar un tiempo (para los distractores de "elige el auxiliar") */
export function firstAuxiliaries(tense: TenseId): string[] {
  const spec = SPECS[tense];
  if (spec.kind === "simple") return spec.time === "present" ? ["do", "does"] : ["did"];
  return [...new Set(SUBJECTS.map(spec.first))];
}

/** La frase en bloques. El primer bloque va en mayúscula; "I" siempre. */
export function conjugate(
  tense: TenseId,
  mood: Mood,
  subject: Subject,
  verb: PracticeVerb,
): Piece[] {
  const spec = SPECS[tense];
  const s: Piece = { role: "subj", text: subject };
  const o: Piece = { role: "obj", text: verb.object };
  let pieces: Piece[];

  if (spec.kind === "simple") {
    const aux = spec.time === "past" ? "did" : isThird(subject) ? "does" : "do";
    const affirmative =
      spec.time === "past"
        ? pastForm(verb.base)
        : isThird(subject)
          ? thirdPerson(verb.base)
          : verb.base;
    const base: Piece = { role: "verb", text: verb.base };
    pieces =
      mood === "pos"
        ? [s, { role: "verb", text: affirmative }, o]
        : mood === "neg"
          ? [s, { role: "aux", text: `${aux} not` }, base, o]
          : [{ role: "aux", text: aux }, s, base, o];
  } else {
    const first = spec.first(subject);
    const rest = spec.rest.map((text): Piece => ({ role: "aux", text }));
    const v: Piece = { role: "verb", text: verbIn(spec.form, verb.base) };
    pieces =
      mood === "pos"
        ? [s, { role: "aux", text: first }, ...rest, v, o]
        : mood === "neg"
          ? [s, { role: "aux", text: `${first} not` }, ...rest, v, o]
          : [{ role: "aux", text: first }, s, ...rest, v, o];
  }

  return pieces.map((piece, i) => (i === 0 ? { ...piece, text: capitalize(piece.text) } : piece));
}

/** La frase como texto, con su punto o interrogación */
export function sentenceOf(pieces: readonly Piece[], mood: Mood): string {
  return `${pieces.map((p) => p.text).join(" ")}${mood === "q" ? "?" : "."}`;
}

/**
 * Formas válidas de la frase. Las contracciones no ambiguas (don't, isn't, I'm…) ya las
 * acepta check.ts; aquí se añaden las ambiguas: he's / she's (is, has) y 'd (had).
 */
export function answerVariants(sentence: string): string[] {
  const contracted = sentence
    .replace(/^(He|She) (is|has)\b/, "$1's")
    .replace(/^(I|You|He|She|We|They) had\b/, "$1'd");
  return contracted === sentence ? [sentence] : [sentence, contracted];
}

// Los datos del sitio original usan s / a / v / o; los colores, subj / aux / verb / obj
const ROLES = { s: "subj", a: "aux", v: "verb", o: "obj" } as const;

/** Bloques de las tablas del Tense Lab, en el mismo formato que conjugate() */
export function piecesFromBlocks(blocks: readonly Block[]): Piece[] {
  return blocks.map(([role, text]) => ({ role: ROLES[role], text }));
}
