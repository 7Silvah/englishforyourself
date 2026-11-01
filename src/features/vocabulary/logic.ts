// Filtros de las listas de vocabulario por nivel (docs/PLAN.md F17c, V4). Lógica pura.
// La importa validateSearch de la ruta de la Biblioteca: solo tipos y funciones pequeñas.
import type { PartOfSpeech, Word, WordGroup, WordList } from "@/content/schema";

// Los 16 tipos de la fuente, en 6 grupos que entiende un estudiante
export const WORD_TYPES = ["noun", "verb", "adjective", "adverb", "phrase", "other"] as const;
export type WordType = (typeof WORD_TYPES)[number];

export function wordType(pos: PartOfSpeech): WordType {
  switch (pos) {
    case "noun":
    case "adjective":
    case "adverb":
    case "phrase":
      return pos;
    case "verb":
    case "phrasal verb":
    case "modal verb":
      return "verb";
    case "idiom":
      return "phrase";
    default:
      return "other";
  }
}

export type VocabularyFilters = { letra?: string; tipo?: WordType; q?: string };

/** Las listas con tipo de palabra se muestran como tabla (las de Face2Face, F17c) */
export function isLevelList(list: WordList): boolean {
  return list.groups.some((g) => g.items.some((w) => w.pos));
}

/** Minúsculas y sin tildes: «Canción» y «cancion» se encuentran igual */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function matches(word: Word, { tipo, q }: VocabularyFilters): boolean {
  if (tipo && (!word.pos || wordType(word.pos) !== tipo)) return false;
  if (!q?.trim()) return true;
  const query = fold(q.trim());
  return fold(word.en).includes(query) || fold(word.es ?? "").includes(query);
}

/**
 * Grupos (letras) con las palabras que pasan los filtros; los grupos vacíos se quitan.
 * Si hay texto, busca en todas las letras: la letra elegida dejaría fuera lo que se busca.
 */
export function filterGroups(
  groups: readonly WordGroup[],
  filters: VocabularyFilters,
): WordGroup[] {
  const letter = filters.q?.trim() ? undefined : filters.letra;
  return groups
    .filter((g) => !letter || g.title === letter)
    .map((g) => ({ ...g, items: g.items.filter((w) => matches(w, filters)) }))
    .filter((g) => g.items.length > 0);
}
