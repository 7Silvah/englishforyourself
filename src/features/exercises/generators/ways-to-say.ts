// Ejercicios generados desde las listas de "ways to say" (docs/PLAN.md §11, F15). Función pura
// con semilla. Practica para qué sirve cada expresión: las opciones incorrectas salen de otras
// listas, salvo de las relacionadas (saludar y preguntar «¿qué tal?» se parecen demasiado).
import { es } from "@/i18n/es";
import { seededShuffle } from "@/lib/random";
import type { Level } from "@/content/schema";
import { normalize } from "../check";
import type { ExerciseSet } from "../schema";
import { options, withIds, type ItemDraft } from "./vocabulary";

export type ExpressionList = {
  path: string; // "ways-to-say/expressions-to-say-hello"
  title: string; // "Expressions to say Hello"
  titleEs: string; // para qué sirve: "Saludar"
  related: readonly string[]; // listas con las que se confunde
  expressions: readonly string[];
};

const t = es.generated.waysToSay;

// Expresiones que se pueden ordenar o dictar: completas y sin alternativas ("I think…", "meet / see")
const complete = (text: string) => !/[…/()]|\.\.\./.test(text);

export function generateWaysToSaySet(
  level: Level,
  current: ExpressionList,
  all: readonly ExpressionList[],
  seed: string,
): ExerciseSet {
  const own = new Set(current.expressions.map(normalize));
  const unrelated = all.filter((l) => l.path !== current.path && !current.related.includes(l.path));
  // De otra lista y que no esté también en esta ("What's new?" está en dos)
  const foreignOf = (list: ExpressionList) =>
    list.expressions.filter((e) => !own.has(normalize(e)));
  const foreign = [...new Set(unrelated.flatMap(foreignOf))];
  const pool = seededShuffle([...new Set(current.expressions)], `ways:${seed}`);
  const drafts: ItemDraft[] = [];
  const add = (item: ItemDraft) => drafts.push(item);
  const purpose = current.titleEs.charAt(0).toLowerCase() + current.titleEs.slice(1);

  // ¿Qué dirías para…? (4)
  pool.slice(0, 4).forEach((expression, i) => {
    const opts = options(expression, seededShuffle(foreign, `${seed}:${i}`));
    if (opts.length >= 2)
      add({
        type: "multiple-choice",
        prompt: t.which(purpose),
        options: opts,
        answer: 0,
        explanationEs: t.explain(expression, purpose),
      });
  });

  // Clasificar: esta lista frente a otra (3 y 3)
  const other = seededShuffle(unrelated, `${seed}:other`)[0];
  if (other) {
    const theirsAll = new Set(other.expressions.map(normalize));
    const mine = pool
      .slice(4)
      .filter((e) => !theirsAll.has(normalize(e)))
      .slice(0, 3);
    const theirs = seededShuffle(foreignOf(other), `${seed}:theirs`).slice(0, 3);
    if (mine.length >= 2 && theirs.length >= 2)
      add({
        type: "categorize",
        categories: [
          { label: current.title, labelEs: current.titleEs, items: mine },
          { label: other.title, labelEs: other.titleEs, items: theirs },
        ],
        explanationEs: t.categorize,
      });
  }

  // Ordenar (2) y dictado (1): expresiones completas de al menos tres palabras
  const sentences = pool.slice(7).filter((e) => complete(e) && e.split(/\s+/).length >= 3);
  sentences.slice(0, 2).forEach((expression) =>
    add({
      type: "word-order",
      answers: [expression],
      explanationEs: t.explain(expression, purpose),
    }),
  );
  const dictated = sentences[2];
  if (dictated)
    add({ type: "dictation", text: dictated, explanationEs: t.explain(dictated, purpose) });

  return {
    title: `${current.title}: practice`,
    titleEs: es.generated.vocabulary.title(current.title),
    instructionEs: t.instruction,
    source: "generated",
    level,
    topics: ["ways-to-say"],
    items: withIds(drafts),
  };
}
