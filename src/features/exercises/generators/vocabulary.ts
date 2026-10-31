// Ejercicios generados desde una lista de vocabulario (docs/PLAN.md §7.5, F14). Función pura:
// la misma semilla da el mismo set. Solo usa palabras con traducción.
import { es } from "@/i18n/es";
import { seededShuffle } from "@/lib/random";
import type { Level } from "@/content/schema";
import type { ExerciseItem, ExerciseSet } from "../schema";

export type VocabWord = { en: string; es: string };

const t = es.generated.vocabulary;

// Un ítem sin id. "Omit" sobre una unión no reparte; este tipo condicional sí:
// es la unión de cada tipo de ítem sin su id.
type ItemDraft = ExerciseItem extends infer Item
  ? Item extends ExerciseItem
    ? Omit<Item, "id">
    : never
  : never;

// Palabras que se pueden escuchar o dictar: sin variantes ni aclaraciones ("Lorry (UK) / truck (US)")
const speakable = (w: VocabWord) => !/[()/]| or /.test(w.en);

/** Opciones distintas: la correcta más hasta 2 de otras palabras con distinto texto */
function options(correct: string, others: readonly string[]): string[] {
  const distractors = [...new Set(others)].filter((o) => o !== correct).slice(0, 2);
  return [correct, ...distractors];
}

export function generateVocabularySet(
  title: string,
  level: Level,
  words: readonly VocabWord[],
  seed: string,
): ExerciseSet {
  const pool = seededShuffle(words, `vocab:${seed}`);
  const pick = (i: number) => pool[i % pool.length];
  const others = (i: number) =>
    seededShuffle(
      pool.filter((_, n) => n !== i % pool.length),
      `${seed}:${i}`,
    );
  const audio = pool.filter(speakable);
  const drafts: ItemDraft[] = [];
  const add = (item: ItemDraft) => drafts.push(item);

  // Inglés → español (3) y español → inglés (2)
  for (let i = 0; i < 5; i++) {
    const w = pick(i);
    if (!w) continue;
    const toEs = i < 3;
    const opts = options(
      toEs ? w.es : w.en,
      others(i).map((o) => (toEs ? o.es : o.en)),
    );
    if (opts.length < 2) continue;
    add({
      type: "multiple-choice",
      prompt: toEs ? w.en : w.es,
      options: opts,
      answer: 0, // el player baraja las opciones
      explanationEs: t.explain(w.en, w.es),
    });
  }

  // Emparejar 4 palabras
  const pairs = pool.slice(5, 9);
  if (new Set(pairs.map((p) => p.es)).size === pairs.length && pairs.length >= 2)
    add({
      type: "match",
      pairs: pairs.map((p) => ({ left: p.en, right: p.es })),
      explanationEs: t.match,
    });

  // Escuchar y elegir (2) y dictado (1): solo palabras que se pueden pronunciar sin ambigüedad
  audio.slice(0, 2).forEach((w, i) => {
    const opts = options(
      w.en,
      seededShuffle(
        audio.filter((o) => o !== w),
        `${seed}:a${i}`,
      ).map((o) => o.en),
    );
    if (opts.length >= 2)
      add({
        type: "listen-choose",
        audioText: w.en,
        options: opts,
        answer: 0,
        explanationEs: t.explain(w.en, w.es),
      });
  });
  const dictated = audio[2];
  if (dictated)
    add({
      type: "dictation",
      text: dictated.en,
      explanationEs: t.explain(dictated.en, dictated.es),
    });

  const items: ExerciseItem[] = drafts.map((draft, i) => ({ ...draft, id: String(i + 1) }));

  return {
    title: `${title}: vocabulary practice`,
    titleEs: t.title(title),
    instructionEs: t.instruction,
    source: "generated",
    level,
    topics: ["vocabulary"],
    items,
  };
}
