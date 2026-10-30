import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// En F6 el loader buscará la unidad en el contenido y lanzará notFound() si no existe.
export const Route = createFileRoute("/curso/$unidad")({
  loader: ({ params }) => ({ crumb: `${es.course.unit} ${params.unidad}` }),
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: UnitPage,
});

function UnitPage() {
  const { crumb } = Route.useLoaderData();
  return (
    <>
      <PageHeader title={crumb} />
      <ComingSoon phase="F6" />
    </>
  );
}
