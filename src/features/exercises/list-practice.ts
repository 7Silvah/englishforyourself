// Qué listas de la Biblioteca se pueden practicar con ejercicios generados y qué datos necesita
// cada generador. Lo importan el loader de /practicar/vocabulario y la Biblioteca, así que va en
// el paquete principal: solo tipos y funciones pequeñas, ningún generador.
import { getSectionLessons, type LessonEntry } from "@/content";
import type { CollocationLists } from "./generators/collocations";
import type { PhrasalVerb } from "./generators/phrasal-verbs";
import type { VocabWord } from "./generators/vocabulary";
import type { ExpressionList } from "./generators/ways-to-say";

export type ListPractice =
  | { kind: "vocabulary"; words: VocabWord[] }
  | { kind: "phrasal-verbs"; words: PhrasalVerb[] }
  | { kind: "collocations"; verb: string; lists: CollocationLists }
  | { kind: "ways-to-say"; current: ExpressionList; all: ExpressionList[] };

// Las collocations que confunde un hispanohablante: «hacer» (make/do) y «tomar» (have/take)
const COLLOCATION_VERBS = ["make", "do", "have", "take"];

/** "collocations/collocations-with-make" → "make" */
const collocationVerb = (lesson: LessonEntry) => lesson.slug.match(/-with-(\w+)$/)?.[1];

/** Secciones que ofrecen práctica, en el orden en que se muestran */
export const PRACTICE_SECTIONS = ["vocabulary", "phrasal-verbs", "collocations", "ways-to-say"];

export function canPractice(lesson: LessonEntry): boolean {
  switch (lesson.section) {
    case "vocabulary":
    case "phrasal-verbs":
      return lesson.translatedCount > 0;
    case "collocations":
      return COLLOCATION_VERBS.includes(collocationVerb(lesson) ?? "");
    case "ways-to-say":
      return Boolean(lesson.meta.titleEs);
    default:
      return false;
  }
}

async function wordsOf(lesson: LessonEntry) {
  const loaded = await lesson.load();
  return loaded.kind === "wordlist" ? loaded.list.groups.flatMap((g) => g.items) : [];
}

/** Los datos para generar la práctica de una lista (y de sus vecinas, si hacen falta) */
export async function loadListPractice(lesson: LessonEntry): Promise<ListPractice | undefined> {
  if (!canPractice(lesson)) return undefined;
  const siblings = getSectionLessons(lesson.section).filter(canPractice);
  switch (lesson.section) {
    case "vocabulary":
      return {
        kind: "vocabulary",
        words: (await wordsOf(lesson)).flatMap((w) => (w.es ? [{ en: w.en, es: w.es }] : [])),
      };
    case "phrasal-verbs":
      return {
        kind: "phrasal-verbs",
        words: (await wordsOf(lesson)).flatMap(({ en, es, example, particle }) =>
          es ? [{ en, es, example, particle }] : [],
        ),
      };
    case "collocations": {
      const entries = await Promise.all(
        siblings.map(async (l) => [collocationVerb(l) ?? "", (await wordsOf(l)).map((w) => w.en)]),
      );
      return {
        kind: "collocations",
        verb: collocationVerb(lesson) ?? "",
        lists: Object.fromEntries(entries),
      };
    }
    case "ways-to-say": {
      const all = await Promise.all(
        siblings.map(async (l) => ({
          path: l.path,
          title: l.meta.title,
          titleEs: l.meta.titleEs ?? "",
          related: l.meta.related ?? [],
          expressions: (await wordsOf(l)).map((w) => w.en),
        })),
      );
      const current = all.find((l) => l.path === lesson.path);
      return current && { kind: "ways-to-say", current, all };
    }
  }
  return undefined;
}
