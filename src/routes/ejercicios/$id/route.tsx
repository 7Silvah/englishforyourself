import { createFileRoute, notFound } from "@tanstack/react-router";
import { getExerciseSet, getNextSetFor, getUnitOfSet } from "@/content";
import { pageTitle } from "@/lib/page-title";

// Ruta contenedora de un set: carga los ítems una vez para el player (index.tsx)
// y para la versión imprimible (imprimir.tsx). Sin "component", muestra su <Outlet />.
export const Route = createFileRoute("/ejercicios/$id")({
  loader: async ({ params }) => {
    const entry = getExerciseSet(params.id);
    if (!entry) throw notFound();
    // Si el set es de una unidad del curso, "Siguiente" sigue el orden de la unidad
    const next = getNextSetFor(entry.id);
    const unit = getUnitOfSet(entry.id);
    return {
      crumb: entry.meta.titleEs,
      set: await entry.load(),
      next: next && { id: next.id, titleEs: next.meta.titleEs },
      unit: unit && { slug: unit.slug, number: unit.meta.number, titleEs: unit.meta.titleEs },
    };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
});
