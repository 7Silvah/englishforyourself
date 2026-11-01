import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { loadPlacementTest } from "@/content";
import { PlacementTest } from "@/features/placement/placement-test";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/prueba-de-nivel")({
  loader: async () => ({ crumb: es.placement.title, test: await loadPlacementTest() }),
  head: () => ({ meta: [{ title: pageTitle(es.placement.title) }] }),
  component: PruebaDeNivelPage,
});

function PruebaDeNivelPage() {
  const { test } = Route.useLoaderData();
  return (
    <>
      <PageHeader title={es.placement.title} description={es.placement.description} />
      <PlacementTest items={test.items} />
    </>
  );
}
