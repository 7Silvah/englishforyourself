import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { SearchPage } from "@/features/search/search-page";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

type Search = { q?: string };

export const Route = createFileRoute("/buscar")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  loader: () => ({ crumb: es.search.title }),
  head: () => ({ meta: [{ title: pageTitle(es.search.title) }] }),
  component: BuscarPage,
});

function BuscarPage() {
  const { q = "" } = Route.useSearch();
  return (
    <>
      <PageHeader
        title={q.trim() ? es.search.resultsFor(q.trim()) : es.search.title}
        description={es.search.description}
      />
      <SearchPage query={q} />
    </>
  );
}
