// Vocabulario en una sola tabla (docs/PLAN.md F17c, V4–V6). Lógica pura: la usan la página
// (que se carga aparte) y load.ts. Los filtros de la URL están en filters.ts.
import { LEVELS } from "@/content/levels";
import type { Level, PartOfSpeech, Word } from "@/content/schema";
import type { VocabularyFilters, WordType } from "./filters";

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

/**
 * Formas de una entrada para compararla con otras listas: sin «to», sin aclaraciones entre
 * paréntesis y separando variantes. "Lorry (UK) / truck (US)" → ["lorry", "truck"];
 * "To get up" → ["get up"]; "Albania – Albanian" → ["albania", "albanian"].
 */
export function wordKeys(en: string): string[] {
  const clean = en
    .toLowerCase()
    .replaceAll("’", "'")
    .replace(/\([^)]*\)/g, " ")
    .trim()
    .replace(/^to\s+/, "");
  const keys = clean
    .split(/\s+\/\s+|\s+[–-]\s+|\s+or\s+/)
    .map((k) =>
      k
        .replace(/^to\s+/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
  return [...new Set(keys)];
}

/** Minúsculas y sin tildes: «Canción» y «cancion» se encuentran igual */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// ---------- Una tabla con todas las listas ----------

/** Una lista de vocabulario, ya cargada */
export type VocabularySource = {
  slug: string;
  title: string; // en español si lo hay: es el nombre del tema
  level?: Level;
  source?: "face2face";
  words: Word[];
};

export type Topic = { slug: string; title: string };

/**
 * Una fila: la palabra, su nivel y los temas en los que aparece. `home` es su lista
 * principal (la de Face2Face o su primer tema): las flashcards de lo filtrado guardan el
 * progreso con la clave de esa lista, así que cuenta igual que al repasarla.
 */
export type VocabularyEntry = Word & { id: string; home: string; topics: Topic[] };
export type VocabularyGroup = { title: string; items: VocabularyEntry[] };

const levelRank = (level: Level | undefined) => (level ? LEVELS.indexOf(level) : LEVELS.length);

// Orden alfabético sin «to» ni paréntesis: «(too) many» va con la M
const sortKey = (en: string) => fold(wordKeys(en)[0] ?? en);

/**
 * Junta las listas de Face2Face (con IPA, tipo y nivel del libro) y las de temas.
 * - Una palabra de Face2Face que sale en dos libros queda una vez, con el nivel más fácil.
 * - Una palabra de un tema que también está en Face2Face no se repite: la fila del libro
 *   gana el tema (y su traducción, si el libro aún no la tiene).
 * - Una palabra que está en dos temas (fork: comedor y cocina) es una fila con los dos.
 */
export function buildVocabulary(sources: readonly VocabularySource[]): VocabularyGroup[] {
  const entries: VocabularyEntry[] = [];
  const bookByKey = new Map<string, VocabularyEntry[]>();
  const bookIds = new Set<string>();
  const topicIds = new Map<string, VocabularyEntry>();

  const books = sources
    .filter((s) => s.source === "face2face")
    .sort((a, b) => levelRank(a.level) - levelRank(b.level));
  for (const book of books)
    for (const w of book.words) {
      const id = `${w.en}|${w.pos ?? ""}`;
      if (bookIds.has(id)) continue;
      bookIds.add(id);
      const entry: VocabularyEntry = {
        ...w,
        id,
        home: book.slug,
        level: w.level ?? book.level,
        topics: [],
      };
      entries.push(entry);
      for (const k of wordKeys(w.en)) bookByKey.set(k, [...(bookByKey.get(k) ?? []), entry]);
    }

  const addTopic = (entry: VocabularyEntry, topic: Topic, from: Word) => {
    if (!entry.topics.some((t) => t.slug === topic.slug)) entry.topics.push(topic);
    entry.es ??= from.es;
    entry.note ??= from.note;
    entry.falseFriend ??= from.falseFriend;
  };

  for (const list of sources) {
    if (list.source === "face2face") continue;
    const topic = { slug: list.slug, title: list.title };
    for (const w of list.words) {
      const keys = wordKeys(w.en);
      // Solo se junta con el libro si es una palabra sin variantes ("lorry / truck" no)
      const inBook = keys.length === 1 && keys[0] ? bookByKey.get(keys[0]) : undefined;
      if (inBook) {
        for (const entry of inBook) addTopic(entry, topic, w);
        continue;
      }
      const id = `t:${fold(w.en)}`;
      const seen = topicIds.get(id);
      if (seen) {
        addTopic(seen, topic, w);
        continue;
      }
      const entry: VocabularyEntry = {
        ...w,
        id,
        home: list.slug,
        level: w.level ?? list.level,
        topics: [topic],
      };
      topicIds.set(id, entry);
      entries.push(entry);
    }
  }

  entries.sort((a, b) => sortKey(a.en).localeCompare(sortKey(b.en), "en"));
  const groups = new Map<string, VocabularyEntry[]>();
  for (const entry of entries) {
    const first =
      sortKey(entry.en)
        .match(/[a-z0-9]/)?.[0]
        ?.toUpperCase() ?? "#";
    const title = /\d/.test(first) ? "0–9" : first;
    groups.set(title, [...(groups.get(title) ?? []), entry]);
  }
  return [...groups].map(([title, items]) => ({ title, items }));
}

function matches(
  entry: VocabularyEntry,
  { nivel, tema, tipo, q, fav }: VocabularyFilters,
  favorites: ReadonlySet<string>,
): boolean {
  if (nivel && entry.level !== nivel) return false;
  if (tema && !entry.topics.some((t) => t.slug === tema)) return false;
  if (tipo && (!entry.pos || wordType(entry.pos) !== tipo)) return false;
  if (fav && !favorites.has(entry.id)) return false;
  if (!q?.trim()) return true;
  const query = fold(q.trim());
  return fold(entry.en).includes(query) || fold(entry.es ?? "").includes(query);
}

/**
 * Grupos (letras) con las palabras que pasan los filtros; los grupos vacíos se quitan.
 * Si hay texto, busca en todas las letras: la letra elegida dejaría fuera lo que se busca.
 * `favorites` son los ids marcados con ⭐ (solo cuentan con ?fav=true).
 */
export function filterGroups(
  groups: readonly VocabularyGroup[],
  filters: VocabularyFilters,
  favorites: ReadonlySet<string> = new Set(),
): VocabularyGroup[] {
  const letter = filters.q?.trim() ? undefined : filters.letra;
  return groups
    .filter((g) => !letter || g.title === letter)
    .map((g) => ({ ...g, items: g.items.filter((e) => matches(e, filters, favorites)) }))
    .filter((g) => g.items.length > 0);
}

/** Las palabras de unos grupos, en orden */
export const entriesOf = (groups: readonly VocabularyGroup[]) => groups.flatMap((g) => g.items);

/** Filas de la página `page` (desde 1), sin romper los grupos por letra */
export function pageOf(
  groups: readonly VocabularyGroup[],
  page: number,
  size: number,
): VocabularyGroup[] {
  let skip = (page - 1) * size;
  let left = size;
  const result: VocabularyGroup[] = [];
  for (const g of groups) {
    if (left <= 0) break;
    if (skip >= g.items.length) {
      skip -= g.items.length;
      continue;
    }
    const items = g.items.slice(skip, skip + left);
    skip = 0;
    left -= items.length;
    result.push({ ...g, items });
  }
  return result;
}

/** Páginas que mostrar: la primera, la última y las dos vecinas de la actual («…» entre medias) */
export function pageNumbers(current: number, total: number): (number | "…")[] {
  const pages = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  return pages.flatMap((p, i) => {
    const prev = pages[i - 1];
    return prev !== undefined && p - prev > 1 ? (["…", p] as const) : [p];
  });
}

/** Cuántas palabras tiene cada tema (para el selector: «Deportes (41)») */
export function countByTopic(groups: readonly VocabularyGroup[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entriesOf(groups))
    for (const t of entry.topics) counts.set(t.slug, (counts.get(t.slug) ?? 0) + 1);
  return counts;
}
