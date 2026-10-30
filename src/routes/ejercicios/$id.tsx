import { createFileRoute, notFound } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { getExerciseSet } from "@/content";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/ejercicios/$id")({
  loader: ({ params }) => {
    const set = getExerciseSet(params.id);
    if (!set) throw notFound();
    return { crumb: set.meta.titleEs, set };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: ExerciseSetPage,
});

// En F5 aquí irá el ExercisePlayer
function ExerciseSetPage() {
  const { set } = Route.useLoaderData();
  return (
    <>
      <PageHeader
        title={set.meta.titleEs}
        description={`${set.meta.instructionEs} · ${es.exercises.itemsCount(set.itemCount)}`}
      />
      <ComingSoon phase="F5" />
    </>
  );
}
