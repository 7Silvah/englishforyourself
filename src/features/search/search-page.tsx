import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { es } from "@/i18n/es";
import { getSearchIndex } from "./documents";
import { groupHits, search } from "./engine";
import { SearchHit } from "./search-hit";
import { useOpenTarget } from "./use-open-target";

const t = es.search;

// Página /buscar?q=: todos los resultados, agrupados. La consulta vive en la URL.
export function SearchPage({ query }: { query: string }) {
  const navigate = useNavigate();
  const openTarget = useOpenTarget();
  const hits = useMemo(() => search(getSearchIndex(), query, 200), [query]);
  const typed = query.trim().length >= 2;

  return (
    <div className="max-w-3xl space-y-6">
      <Input
        type="search"
        value={query}
        // replace: cada letra no debe crear una entrada nueva en el historial
        onChange={(e) =>
          void navigate({ to: "/buscar", search: { q: e.target.value }, replace: true })
        }
        placeholder={t.placeholder}
        aria-label={t.title}
        autoFocus
        className="h-11 text-lg md:text-lg"
      />
      <div aria-live="polite" className="space-y-6">
        {!typed && <p className="text-muted-foreground">{t.hint}</p>}
        {typed && hits.length === 0 && (
          <p className="text-muted-foreground">{t.empty(query.trim())}</p>
        )}
        {groupHits(hits).map((group) => (
          <section key={group.type} aria-labelledby={`group-${group.type}`} className="space-y-2">
            <h2 id={`group-${group.type}`} className="font-heading text-lg font-semibold">
              {t.groups[group.type]} ({group.hits.length})
            </h2>
            <ul className="divide-y rounded-lg border">
              {group.hits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onClick={() => void openTarget(hit.target)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <SearchHit hit={hit} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
