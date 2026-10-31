import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { TENSES, type TenseId } from "@/content/data/tense-index";
import { TenseLab } from "@/features/tense-lab/tense-lab";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

type Search = { tense?: TenseId };

export const Route = createFileRoute("/herramientas/tense-lab")({
  // ?tense=present-perfect. Un valor desconocido se ignora (se muestra el primero).
  validateSearch: (search: Record<string, unknown>): Search => ({
    tense: TENSES.find((x) => x.id === search.tense)?.id,
  }),
  loader: () => ({ crumb: es.tenseLab.title }),
  head: () => ({ meta: [{ title: pageTitle(es.tenseLab.title) }] }),
  component: TenseLabPage,
});

function TenseLabPage() {
  const { tense = "simple-present" } = Route.useSearch();
  return (
    <>
      <PageHeader title={es.tenseLab.title} description={es.tenseLab.description} />
      {/* key: al cambiar de tiempo, el selector de sujeto vuelve al primero */}
      <TenseLab key={tense} tense={tense} />
    </>
  );
}
