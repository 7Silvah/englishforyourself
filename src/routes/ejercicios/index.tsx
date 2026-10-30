import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { LEVELS } from "@/content/levels";
import { ExerciseCatalog, type CatalogFilters } from "@/features/exercises/exercise-catalog";
import { es } from "@/i18n/es";

export const Route = createFileRoute("/ejercicios/")({
  // Filtros en la URL: ?nivel=A2&tema=verb-tenses. Lo que no sea válido se ignora.
  validateSearch: (search: Record<string, unknown>): CatalogFilters => ({
    nivel: LEVELS.find((level) => level === search.nivel),
    tema: typeof search.tema === "string" ? search.tema : undefined,
  }),
  component: ExercisesPage,
});

function ExercisesPage() {
  const filters = Route.useSearch();
  return (
    <>
      <PageHeader title={es.exercises.title} description={es.exercises.description} />
      <ExerciseCatalog filters={filters} />
    </>
  );
}
