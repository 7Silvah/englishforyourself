import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { ExerciseSetInfo } from "@/features/exercises/exercise-set-info";
import { ExerciseSession } from "@/features/exercises/player/exercise-session";

type Search = { modo?: "examen" };

const setRoute = getRouteApi("/ejercicios/$id");

export const Route = createFileRoute("/ejercicios/$id/")({
  // El modo vive en la URL (?modo=examen): se puede compartir y sobrevive a recargar
  validateSearch: (search: Record<string, unknown>): Search =>
    search.modo === "examen" ? { modo: "examen" } : {},
  component: ExerciseSetPage,
});

function ExerciseSetPage() {
  const { set, next } = setRoute.useLoaderData();
  const { id } = Route.useParams();
  const { modo } = Route.useSearch();
  const mode = modo === "examen" ? "exam" : "practice";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={set.titleEs} description={set.instructionEs}>
        <ExerciseSetInfo id={id} set={set} mode={mode} />
      </PageHeader>
      {/* key: al cambiar de set o de modo, la sesión empieza de cero */}
      <ExerciseSession
        key={`${id}-${mode}`}
        setId={id}
        items={set.items}
        mode={mode}
        nextSet={next}
      />
    </div>
  );
}
