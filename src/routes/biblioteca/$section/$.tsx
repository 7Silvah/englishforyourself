import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// Ruta "splat" ($): captura el resto de la URL, incluidas subcarpetas,
// p. ej. /biblioteca/grammar/adjectives/types-of-adjectives → _splat = "adjectives/types-of-adjectives".
// En F4 el loader buscará la lección y lanzará notFound() si no existe.
export const Route = createFileRoute("/biblioteca/$section/$")({
  loader: ({ params }) => ({ crumb: `${es.library.lesson}: ${params._splat ?? ""}` }),
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: LessonPage,
});

function LessonPage() {
  const { crumb } = Route.useLoaderData();
  return (
    <>
      <PageHeader title={crumb} />
      <ComingSoon phase="F4" />
    </>
  );
}
