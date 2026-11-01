// Las listas de la sección Vocabulario como fuentes de la tabla (F17c V5). Lo importa el
// loader de /biblioteca/$section: solo el manifiesto y funciones pequeñas.
import { getAllLessons, type LessonEntry } from "@/content";
import type { Topic, VocabularyFilters, VocabularySource } from "./logic";

export const VOCABULARY_SECTION = "vocabulary";

/** Todas las listas de la sección, también las sublistas (el aeropuerto, el hotel…) */
function vocabularyLessons(): LessonEntry[] {
  return getAllLessons().filter(
    (l) => l.section === VOCABULARY_SECTION && l.meta.kind === "wordlist",
  );
}

const isBook = (lesson: LessonEntry) =>
  lesson.meta.kind === "wordlist" && lesson.meta.source === "face2face";

const topicTitle = (lesson: LessonEntry) => lesson.meta.titleEs ?? lesson.meta.title;

/** Los temas (no las listas de Face2Face), por orden alfabético en español */
export function vocabularyTopics(): Topic[] {
  return vocabularyLessons()
    .filter((l) => !isBook(l))
    .map((l) => ({ slug: l.slug, title: topicTitle(l) }))
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

/** Carga el cuerpo de todas las listas (cada una es un chunk aparte) */
export async function loadVocabulary(): Promise<VocabularySource[]> {
  return Promise.all(
    vocabularyLessons().map(async (lesson) => {
      const loaded = await lesson.load();
      return {
        slug: lesson.slug,
        title: topicTitle(lesson),
        level: lesson.meta.level,
        source: isBook(lesson) ? "face2face" : undefined,
        words: loaded.kind === "wordlist" ? loaded.list.groups.flatMap((g) => g.items) : [],
      };
    }),
  );
}

/**
 * Lista con la que practicar lo que se está viendo: la del tema elegido o, si solo hay
 * nivel, la de Face2Face de ese nivel. Las flashcards y los ejercicios van por listas.
 */
export function practiceLesson(filters: VocabularyFilters): LessonEntry | undefined {
  const lessons = vocabularyLessons();
  if (filters.tema) return lessons.find((l) => l.slug === filters.tema);
  if (filters.nivel) return lessons.find((l) => isBook(l) && l.meta.level === filters.nivel);
  return undefined;
}

/** Adónde lleva la URL de una lista de vocabulario: la tabla, filtrada por su tema o nivel */
export function vocabularyRedirect(lesson: LessonEntry): VocabularyFilters {
  return isBook(lesson) ? { nivel: lesson.meta.level } : { tema: lesson.slug };
}
