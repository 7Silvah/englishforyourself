// Ejercicios generados desde las listas de collocations (docs/PLAN.md §11, F15). Función pura
// con semilla. Practica el verbo que va con cada palabra: el error típico del hispanohablante
// es traducir "hacer" o "tomar" (*make homework*, *take dinner*).
import { es } from "@/i18n/es";
import { seededShuffle } from "@/lib/random";
import type { Level } from "@/content/schema";
import type { ExerciseSet } from "../schema";
import { withIds, type ItemDraft } from "./vocabulary";

/** Collocations de cada verbo: { make: ["Make a decision", …], do: […] } */
export type CollocationLists = Readonly<Record<string, readonly string[]>>;

const t = es.generated.collocations;

// Combinaciones correctas que no están en las listas (a veces con otro significado: "have a
// job" es tener trabajo): no pueden salir como opción incorrecta. Revisadas una a una.
const ALSO_VALID = new Set([
  "have a call",
  "have a choice",
  "have a comment",
  "have a complaint",
  "have a connection",
  "have a contract",
  "do a deal",
  "have a deal",
  "take a deal",
  "take a decision",
  "have a fortune",
  "have a joke",
  "take a joke",
  "take a loss",
  "take a measurement",
  "have a mess",
  "do a presentation",
  "have a presentation",
  "take a profit",
  "have a proposal",
  "have a pizza",
  "take a pizza",
  "do a speech",
  "take a statement",
  "have a suggestion / recommendation",
  "have an arrangement",
  "have an attempt",
  "have an impression",
  "have an observation",
  "have friends",
  "have money",
  "take money",
  "have notes",
  "have plans",
  "have room",
  "have sense",
  "have tea",
  "take tea",
  "have time",
  "do time",
  "have trouble",
  "take trouble",
  "make a drawing",
  "have a favour",
  "have a good job",
  "have a job",
  "take a job",
  "make a meal plan",
  "have a meal plan",
  "make a painting",
  "have a painting",
  "have a project",
  "make a report",
  "have a report",
  "make a sculpture",
  "have a sculpture",
  "have a task",
  "make a trip",
  "have a trip",
  "take a trip",
  "have a vacation",
  "take a vacation",
  "have a workout",
  "have an activity",
  "make an analysis",
  "make an assessment",
  "take an assessment",
  "have an assessment",
  "have an assignment",
  "have an errand",
  "make an evaluation",
  "have an evaluation",
  "take an evaluation",
  "have an exam",
  "take an exam",
  "make an exam",
  "make an experiment",
  "take an interview",
  "make an investigation",
  "have an operation",
  "make better",
  "have business",
  "have chores",
  "take damage",
  "take exercise",
  "make experiments",
  "have homework",
  "make nothing",
  "have nothing",
  "take nothing",
  "have the exam",
  "take the exam",
  "make something",
  "have something",
  "take something",
  "have something wrong",
  "make something wrong",
  "have the paperwork",
  "have the right thing",
  "take the right thing",
  "take well",
  "have your hair",
  "have your homework",
  "have your makeup",
  "take a bath",
  "make a break",
  "take a class",
  "do a class",
  "do a competition",
  "make a cup of coffee",
  "take a cup of coffee",
  "take a day off",
  "make a drink",
  "take a drink",
  "make a game",
  "make a goal",
  "take a holiday",
  "do a lecture",
  "take a lesson",
  "do a lesson",
  "make a meal",
  "take a meeting",
  "take a moment",
  "make a plan",
  "make a problem",
  "take a ride",
  "take a swim",
  "take a taste",
  "make a wish",
  "make an appointment with",
  "make an argument",
  "make an excuse",
  "make dinner",
  "do dinner",
  "make fun",
  "make lunch",
  "do lunch",
  "make a picture",
  "have a picture",
  "make a plane",
  "have a plane",
  "have a rest",
  "have a sample",
  "have a seat",
  "do a test / exam",
  "have a test / exam",
  "make a video",
  "have a video",
  "have lessons",
  "do lessons",
  "have medication",
  "have turns",
]);

// "have" + sustantivo casi siempre es correcto en el sentido de "tener" ("have a marathon":
// hay un maratón), así que nunca sale como opción incorrecta
const NEVER_WRONG = new Set(["have"]);

// Pareja de cada verbo para clasificar: los dos de "hacer" y los dos de "tomar"
const PARTNER: Readonly<Record<string, string>> = {
  make: "do",
  do: "make",
  have: "take",
  take: "have",
};

/** "Make a decision" con el verbo "make" → "a decision" */
export function collocationRest(entry: string, verb: string): string | undefined {
  const prefix = `${verb} `;
  return entry.toLowerCase().startsWith(prefix) ? entry.slice(prefix.length) : undefined;
}

export function generateCollocationSet(
  title: string,
  level: Level,
  verb: string,
  lists: CollocationLists,
  seed: string,
): ExerciseSet {
  const verbs = Object.keys(lists);
  const restsOf = (v: string) =>
    (lists[v] ?? []).flatMap((entry) => {
      const rest = collocationRest(entry, v);
      return rest ? [rest] : [];
    });
  // Todas las combinaciones que se consideran correctas
  const valid = new Set(verbs.flatMap((v) => restsOf(v).map((r) => `${v} ${r}`.toLowerCase())));
  const isValid = (v: string, rest: string) => {
    const key = `${v} ${rest}`.toLowerCase();
    return valid.has(key) || ALSO_VALID.has(key);
  };
  const wrongVerbs = (rest: string) =>
    verbs.filter((v) => v !== verb && !NEVER_WRONG.has(v) && !isValid(v, rest));

  // Solo las palabras con al menos dos verbos que no encajan: así hay tres opciones
  const pool = seededShuffle(restsOf(verb), `colloc:${seed}`).filter(
    (rest) => wrongVerbs(rest).length >= 2,
  );
  const drafts: ItemDraft[] = [];
  const add = (item: ItemDraft) => drafts.push(item);

  // Elegir el verbo (7)
  pool.slice(0, 7).forEach((rest, i) => {
    const wrong = seededShuffle(wrongVerbs(rest), `${seed}:${i}`).slice(0, 2);
    add({
      type: "multiple-choice",
      prompt: `___ ${rest}`,
      options: [verb, ...wrong],
      answer: 0,
      explanationEs: t.explain(`${verb} ${rest}`),
    });
  });

  // Clasificar: este verbo frente a su pareja (3 y 3), solo palabras que no valen con los dos
  const other = PARTNER[verb];
  if (other && lists[other]) {
    const mine = pool
      .slice(7)
      .filter((r) => !isValid(other, r))
      .slice(0, 3);
    const theirs = seededShuffle(restsOf(other), `${seed}:theirs`)
      .filter((r) => !isValid(verb, r) && !mine.includes(r))
      .slice(0, 3);
    if (mine.length >= 2 && theirs.length >= 2)
      add({
        type: "categorize",
        categories: [
          { label: verb, items: mine },
          { label: other, items: theirs },
        ],
        explanationEs: t.categorize(verb, other),
      });
  }

  return {
    title: `${title}: collocation practice`,
    titleEs: es.generated.vocabulary.title(title),
    instructionEs: t.instruction,
    source: "generated",
    level,
    topics: ["collocations"],
    items: withIds(drafts),
  };
}
