// Ejercicios generados de un tiempo verbal (docs/PLAN.md §7.5). Función pura: la misma
// semilla da siempre el mismo set; otra semilla, ejercicios nuevos.
import type { TenseInfo } from "@/content/data/tense-index";
import {
  answerVariants,
  conjugate,
  firstAuxiliaries,
  PRACTICE_VERBS,
  sentenceOf,
  SUBJECTS,
  type Mood,
  type Piece,
} from "@/features/tense-lab/conjugate";
import { es } from "@/i18n/es";
import { createRandom, pick, seededShuffle } from "@/lib/random";
import type { ExerciseItem, ExerciseSet } from "../schema";

const t = es.generated;

type Kind = "transform-neg" | "transform-q" | "aux" | "order" | "table";

// Reparto de los 8 ítems de una ronda
const KINDS: readonly Kind[] = [
  "transform-neg",
  "aux",
  "transform-q",
  "order",
  "table",
  "aux",
  "transform-neg",
  "order",
];

// Auxiliares con los que se confunde a menudo el correcto
const CONFUSERS = ["do", "does", "did", "is", "are", "am", "has", "have", "was", "were", "will"];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function generateTenseSet(tense: TenseInfo, seed: string): ExerciseSet {
  const random = createRandom(`${tense.id}:${seed}`);
  const simple = tense.id === "simple-present" || tense.id === "simple-past";
  // Sujetos y verbos barajados para que no se repitan seguidos
  const subjects = seededShuffle(SUBJECTS, `${seed}:s`);
  const verbs = seededShuffle(PRACTICE_VERBS, `${seed}:v`);

  const items = KINDS.map((kind, i): ExerciseItem => {
    const subject = subjects[i % subjects.length] ?? "I";
    const verb = verbs[i % verbs.length] ?? PRACTICE_VERBS[0];
    if (!verb) throw new Error("PRACTICE_VERBS vacío");
    const id = String(i + 1);
    const build = (mood: Mood) => conjugate(tense.id, mood, subject, verb);
    const say = (mood: Mood) => sentenceOf(build(mood), mood);

    switch (kind) {
      case "transform-neg":
      case "transform-q": {
        const to = kind === "transform-neg" ? "neg" : "q";
        return {
          id,
          type: "transform",
          source: say("pos"),
          to,
          answers: answerVariants(say(to)),
          explanationEs:
            to === "neg"
              ? simple
                ? t.explain.negSimple
                : t.explain.neg
              : simple
                ? t.explain.qSimple
                : t.explain.q,
        };
      }
      case "aux": {
        // En afirmativa los tiempos simples no tienen auxiliar: se usa negativa o pregunta
        const mood: Mood = simple || random() < 0.5 ? (random() < 0.5 ? "neg" : "q") : "pos";
        const pieces = build(mood);
        const at = pieces.findIndex((p) => p.role === "aux");
        const correct = pieces[at]?.text ?? "";
        const format = (aux: string) => {
          const text = mood === "neg" ? `${aux} not` : aux;
          return at === 0 ? capitalize(text) : text;
        };
        const pool = [...new Set([...firstAuxiliaries(tense.id), ...CONFUSERS].map(format))].filter(
          (option) => option.toLowerCase() !== correct.toLowerCase(),
        );
        const distractors = seededShuffle(pool, `${seed}:d${i}`).slice(0, 2);
        const prompt = sentenceOf(
          pieces.map((p, n): Piece => (n === at ? { ...p, text: "___" } : p)),
          mood,
        );
        return {
          id,
          type: "multiple-choice",
          prompt,
          options: [correct, ...distractors],
          answer: 0, // el player baraja las opciones
          explanationEs: t.explain.aux(tense.name),
        };
      }
      case "order": {
        const mood: Mood = random() < 0.5 ? "neg" : "q";
        const sentence = say(mood);
        // Distractor: otro auxiliar que suena posible
        const wrong = pick(
          CONFUSERS.filter((aux) => !sentence.toLowerCase().split(" ").includes(aux)),
          random,
        );
        return {
          id,
          type: "word-order",
          answers: [sentence],
          distractors: [wrong],
          explanationEs: t.explain.order,
        };
      }
      case "table": {
        // Se muestra una de las tres formas y hay que escribir las otras dos
        const shown = pick<Mood>(["pos", "neg", "q"], random);
        const cells = (["pos", "neg", "q"] as const).map((mood) =>
          mood === shown ? say(mood) : { answers: answerVariants(say(mood)) },
        );
        return {
          id,
          type: "table-fill",
          caption: tense.name,
          columns: ["Positive", "Negative", "Question"],
          rows: [{ header: `${subject} / ${verb.base}`, cells }],
          explanationEs: t.explain.table,
        };
      }
    }
  });

  return {
    title: `${tense.name}: generated practice`,
    titleEs: t.title(tense.nameEs),
    instructionEs: t.instruction,
    source: "generated",
    level: tense.level,
    topics: [tense.id],
    items,
  };
}
