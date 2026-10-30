import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// En F5 el loader buscará el set de ejercicios y lanzará notFound() si no existe.
export const Route = createFileRoute("/ejercicios/$id")({
  loader: ({ params }) => ({ crumb: `${es.exercises.set}: ${params.id}` }),
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: ExerciseSetPage,
});

function ExerciseSetPage() {
  const { crumb } = Route.useLoaderData();
  return (
    <>
      <PageHeader title={crumb} />
      <ComingSoon phase="F5" />
    </>
  );
}
