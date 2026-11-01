// Cargar, unir y filtrar las listas de Vocabulario (F17c V5–V6). Es la parte pesada: los
// loaders la importan con import() para que no entre en la carga inicial de la app.
import { es } from "@/i18n/es";
import { wordFilters, type VocabularyFilters } from "./filters";
import { isBook, topicTitle, vocabularyLessons, vocabularyTopics } from "./lessons";
import {
  buildVocabulary,
  entriesOf,
  filterGroups,
  type VocabularyEntry,
  type VocabularySource,
} from "./logic";
import { useVocabularyStore } from "./store";

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

/** Las palabras que pasan los filtros (con ?fav=true, las favoritas guardadas en el navegador) */
export async function loadFilteredEntries(filters: VocabularyFilters): Promise<VocabularyEntry[]> {
  const groups = buildVocabulary(await loadVocabulary());
  const favorites = new Set(useVocabularyStore.getState().favorites);
  return entriesOf(filterGroups(groups, wordFilters(filters), favorites));
}

/** Los filtros elegidos, en palabras: «C1», «Deportes», «Verbos»… (chips y títulos) */
export function filterLabels(filters: VocabularyFilters): string[] {
  const t = es.library.vocabularyTable;
  const topic = filters.tema && vocabularyTopics().find((x) => x.slug === filters.tema);
  return [
    filters.nivel,
    topic ? topic.title : undefined,
    filters.tipo && t.types[filters.tipo],
    filters.letra,
    filters.q && `«${filters.q}»`,
    filters.fav && t.chipFavorites,
  ].filter((label): label is string => Boolean(label));
}
