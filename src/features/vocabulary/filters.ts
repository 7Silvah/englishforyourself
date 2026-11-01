// Filtros de la tabla de Vocabulario en la URL (F17c V5–V6). Lo importan los validateSearch
// de la Biblioteca y de las prácticas, que van en el paquete principal: por eso está aparte
// y es pequeño (la lógica de la tabla, en logic.ts, solo la carga la página).
import { LEVELS } from "@/content/levels";
import type { Level } from "@/content/schema";

// Los 16 tipos de la fuente, en 6 grupos que entiende un estudiante
export const WORD_TYPES = ["noun", "verb", "adjective", "adverb", "phrase", "other"] as const;
export type WordType = (typeof WORD_TYPES)[number];

/**
 * Filtros de la tabla, en la URL: ?nivel=A2&tema=animals-vocabulary&tipo=noun&letra=B&q=casa
 * &fav=true (solo favoritas) &pagina=2. Las prácticas de lo filtrado usan los mismos.
 */
export type VocabularyFilters = {
  nivel?: Level;
  tema?: string;
  tipo?: WordType;
  letra?: string;
  q?: string;
  fav?: true;
  pagina?: number;
};

/** Lo que la URL trae, validado: lo que no sea válido se ignora */
export function parseFilters(search: Record<string, unknown>): VocabularyFilters {
  const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);
  const page = Number(search.pagina);
  return {
    nivel: LEVELS.find((level) => level === search.nivel),
    tema: text(search.tema),
    tipo: WORD_TYPES.find((type) => type === search.tipo),
    letra: text(search.letra),
    q: text(search.q),
    fav: search.fav === true || search.fav === "true" ? true : undefined,
    pagina: Number.isInteger(page) && page > 1 ? page : undefined,
  };
}

/** Los filtros que eligen palabras (sin la página): los que se pasan a las prácticas */
export function wordFilters({ pagina: _page, ...filters }: VocabularyFilters): VocabularyFilters {
  return filters;
}

/**
 * Búsqueda de /practicar/flashcards y /practicar/vocabulario: una lista (?lista=) o, con
 * ?vocabulario=true, las palabras de la tabla de Vocabulario que pasan los filtros.
 */
export type PracticeSearch = VocabularyFilters & { lista?: string; vocabulario?: true };

export function parsePracticeSearch(search: Record<string, unknown>): PracticeSearch {
  const vocabulario = search.vocabulario === true || search.vocabulario === "true";
  return {
    lista: typeof search.lista === "string" ? search.lista : undefined,
    ...(vocabulario && { vocabulario: true, ...wordFilters(parseFilters(search)) }),
  };
}
