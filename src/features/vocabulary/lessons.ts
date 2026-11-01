// Las listas de la sección Vocabulario: temas y redirecciones (F17c V5). Lo importan la
// Biblioteca y su loader, en el paquete principal: solo el manifiesto y funciones pequeñas.
// Cargar, unir y filtrar las listas está en load.ts, que se importa con import().
import { getAllLessons, type LessonEntry } from "@/content";
import type { VocabularyFilters } from "./filters";
import type { Topic } from "./logic";

export const VOCABULARY_SECTION = "vocabulary";

/** Todas las listas de la sección, también las sublistas (el aeropuerto, el hotel…) */
export function vocabularyLessons(): LessonEntry[] {
  return getAllLessons().filter(
    (l) => l.section === VOCABULARY_SECTION && l.meta.kind === "wordlist",
  );
}

export const isBook = (lesson: LessonEntry) =>
  lesson.meta.kind === "wordlist" && lesson.meta.source === "face2face";

export const topicTitle = (lesson: LessonEntry) => lesson.meta.titleEs ?? lesson.meta.title;

/** Los temas (no las listas de Face2Face), por orden alfabético en español */
export function vocabularyTopics(): Topic[] {
  return vocabularyLessons()
    .filter((l) => !isBook(l))
    .map((l) => ({ slug: l.slug, title: topicTitle(l) }))
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

/** Adónde lleva la URL de una lista de vocabulario: la tabla, filtrada por su tema o nivel */
export function vocabularyRedirect(lesson: LessonEntry): VocabularyFilters {
  return isBook(lesson) ? { nivel: lesson.meta.level } : { tema: lesson.slug };
}
