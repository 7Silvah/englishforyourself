// Motor del buscador (MiniSearch). Lógica pura: recibe los documentos y devuelve resultados.
// Los documentos los arma documents.ts a partir del contenido.
import MiniSearch from "minisearch";

export type SearchTarget =
  | { kind: "lesson"; section: string; slug: string }
  | { kind: "unit"; slug: string }
  | { kind: "set"; id: string }
  | { kind: "tense"; id: string };

export type SearchType = "unit" | "lesson" | "set" | "tense" | "word";

export type SearchDoc = {
  id: string;
  type: SearchType;
  title: string; // lo que se muestra en grande
  subtitle?: string; // traducción, título en inglés o sección
  text?: string; // se busca pero no se muestra (resúmenes)
  target: SearchTarget;
};

export type SearchHit = Omit<SearchDoc, "text"> & { score: number };

// Orden de los grupos en los resultados
export const SEARCH_TYPES: readonly SearchType[] = ["unit", "lesson", "tense", "set", "word"];

/** Minúsculas y sin tildes: "Lección" y "leccion" son el mismo término */
export function foldTerm(term: string): string {
  // NFD separa la letra de su tilde (á → a + ´); luego se borran las tildes sueltas
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function createSearchIndex(docs: readonly SearchDoc[]): MiniSearch<SearchDoc> {
  const index = new MiniSearch<SearchDoc>({
    fields: ["title", "subtitle", "text"],
    storeFields: ["type", "title", "subtitle", "target"],
    processTerm: foldTerm,
    searchOptions: {
      boost: { title: 3, subtitle: 2 },
      prefix: true, // "pres" encuentra "present"
      fuzzy: (term) => (term.length > 3 ? 0.2 : false), // tolera una errata en palabras largas
      combineWith: "AND",
    },
  });
  index.addAll(docs);
  return index;
}

function isTarget(value: unknown): value is SearchTarget {
  return typeof value === "object" && value !== null && "kind" in value;
}

function isType(value: unknown): value is SearchType {
  return SEARCH_TYPES.some((t) => t === value);
}

export function search(index: MiniSearch<SearchDoc>, query: string, limit = 50): SearchHit[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return index
    .search(q)
    .flatMap((r): SearchHit[] => {
      const { id, score, type, title, subtitle, target } = r;
      if (!isType(type) || typeof title !== "string" || !isTarget(target)) return [];
      return [
        {
          id: String(id),
          score,
          type,
          title,
          subtitle: typeof subtitle === "string" ? subtitle : undefined,
          target,
        },
      ];
    })
    .slice(0, limit);
}

/** Resultados agrupados por tipo, en el orden de SEARCH_TYPES, con un máximo por grupo */
export function groupHits(
  hits: readonly SearchHit[],
  perGroup = Infinity,
): { type: SearchType; hits: SearchHit[] }[] {
  return SEARCH_TYPES.map((type) => ({
    type,
    hits: hits.filter((h) => h.type === type).slice(0, perGroup),
  })).filter((g) => g.hits.length > 0);
}
