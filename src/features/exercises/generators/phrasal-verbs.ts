// Ejercicios generados desde una lista de phrasal verbs (docs/PLAN.md §11, F15). Función pura
// con semilla. Usa las palabras con traducción; las que además tienen partícula y ejemplo
// sirven para "elige la partícula" y "completa la partícula".
import { es } from "@/i18n/es";
import { seededShuffle } from "@/lib/random";
import type { Level } from "@/content/schema";
import type { ExerciseSet } from "../schema";
import { options, withIds, type ItemDraft } from "./vocabulary";

export type PhrasalVerb = { en: string; es: string; example?: string; particle?: string };

const t = es.generated.phrasalVerbs;

// Partículas frecuentes: completan las opciones cuando la lista tiene pocas distintas
// (las de dos palabras, para que "away with" no se distinga solo por la forma)
const COMMON_PARTICLES = [
  ...["up", "down", "in", "out", "on", "off", "away", "back", "over", "through", "around"],
  ...["about", "into", "after", "under", "past", "apart", "forward", "with", "for"],
  ...["out of", "up with", "on with", "down on", "up to", "in for", "away from", "back at"],
];

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Apariciones de la partícula como palabras completas ("out" no vale dentro de "outside") */
export function particleMatches(text: string, particle: string): RegExpExecArray[] {
  const words = particle.trim().split(/\s+/).map(escapeRegExp).join("\\s+");
  return [...text.matchAll(new RegExp(`\\b${words}\\b`, "gi"))];
}

/** El ejemplo con la partícula cambiada por un hueco ("I gave ___ smoking.") */
export function blankParticle(example: string, particle: string): string {
  const match = particleMatches(example, particle)[0];
  if (!match) return example;
  return example.slice(0, match.index) + "___" + example.slice(match.index + match[0].length);
}

/** "To get along with" → "get" */
const verbOf = (en: string) =>
  en
    .replace(/^to\s+/i, "")
    .split(/\s+/)[0]
    ?.toLowerCase() ?? "";
const wordCount = (text: string) => text.trim().split(/\s+/).length;

/** Partículas que no forman con el mismo verbo otro phrasal verb de la lista (sería ambiguo) */
function particleDistractors(word: PhrasalVerb, words: readonly PhrasalVerb[], seed: string) {
  const particle = (word.particle ?? "").toLowerCase();
  const verb = verbOf(word.en);
  const taken = new Set(
    words.filter((w) => verbOf(w.en) === verb).map((w) => (w.particle ?? "").toLowerCase()),
  );
  const fromList = words.map((w) => (w.particle ?? "").toLowerCase());
  const candidates = [...new Set([...fromList, ...COMMON_PARTICLES])].filter(
    (p) => p && p !== particle && !taken.has(p),
  );
  // Primero las del mismo número de palabras ("up with" frente a "out of")
  const sameShape = candidates.filter((p) => wordCount(p) === wordCount(particle));
  const rest = candidates.filter((p) => wordCount(p) !== wordCount(particle));
  return [...seededShuffle(sameShape, seed), ...seededShuffle(rest, seed)];
}

export function generatePhrasalVerbSet(
  title: string,
  level: Level,
  words: readonly PhrasalVerb[],
  seed: string,
): ExerciseSet {
  const pool = seededShuffle(words, `phrasal:${seed}`);
  const withExample = pool.filter((w) => w.particle && w.example);
  // En una lista con una sola partícula (la de "away") la respuesta sería siempre la misma
  const particles = new Set(withExample.map((w) => (w.particle ?? "").toLowerCase()));
  const practiceParticles = particles.size >= 3;
  const drafts: ItemDraft[] = [];
  const add = (item: ItemDraft) => drafts.push(item);
  const explain = (w: PhrasalVerb) => t.explain(w.en, w.es);

  if (practiceParticles) {
    // Elegir la partícula (3) y escribirla (2)
    withExample.slice(0, 5).forEach((w, i) => {
      const particle = w.particle ?? "";
      const text = blankParticle(w.example ?? "", particle);
      if (i < 3) {
        const opts = options(particle, particleDistractors(w, words, `${seed}:${i}`));
        add({
          type: "multiple-choice",
          prompt: text,
          options: opts,
          answer: 0,
          // El significado deshace la ambigüedad cuando otra partícula también formaría una frase
          hintEs: t.hint(w.es),
          explanationEs: explain(w),
        });
      } else
        add({
          type: "fill-blank",
          text,
          blanks: [{ answers: [particle] }],
          hintEs: t.hint(w.es),
          explanationEs: explain(w),
        });
    });
  }

  // Significado: inglés → español y español → inglés (más si no hay ejercicios de partícula)
  const meaningCount = practiceParticles ? 2 : 5;
  const used = new Set(drafts.length > 0 ? withExample.slice(0, 5) : []);
  const forMeaning = pool.filter((w) => !used.has(w));
  forMeaning.slice(0, meaningCount).forEach((w, i) => {
    const toEs = i % 2 === 0;
    const others = seededShuffle(
      forMeaning.filter((o) => o !== w),
      `${seed}:m${i}`,
    );
    const opts = options(
      toEs ? w.es : w.en,
      others.map((o) => (toEs ? o.es : o.en)),
    );
    if (opts.length >= 2)
      add({
        type: "multiple-choice",
        prompt: toEs ? w.en : w.es,
        options: opts,
        answer: 0,
        explanationEs: explain(w),
      });
  });

  // Emparejar 4 phrasal verbs con su significado
  const pairs = forMeaning.slice(meaningCount, meaningCount + 4);
  if (pairs.length >= 2 && new Set(pairs.map((p) => p.es)).size === pairs.length)
    add({
      type: "match",
      pairs: pairs.map((p) => ({ left: p.en, right: p.es })),
      explanationEs: t.match,
    });

  return {
    title: `${title}: phrasal verb practice`,
    titleEs: es.generated.vocabulary.title(title),
    instructionEs: t.instruction,
    source: "generated",
    level,
    topics: ["phrasal-verbs"],
    items: withIds(drafts),
  };
}
