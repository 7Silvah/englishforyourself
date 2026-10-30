import { createFileRoute, notFound } from "@tanstack/react-router";
import { getExerciseSet, getNextExerciseSet } from "@/content";
import { pageTitle } from "@/lib/page-title";

// Ruta contenedora de un set: carga los ítems una vez para el player (index.tsx)
// y para la versión imprimible (imprimir.tsx). Sin "component", muestra su <Outlet />.
export const Route = createFileRoute("/ejercicios/$id")({
  loader: async ({ params }) => {
    const entry = getExerciseSet(params.id);
    if (!entry) throw notFound();
    const next = getNextExerciseSet(entry.id);
    return {
      crumb: entry.meta.titleEs,
      set: await entry.load(),
      next: next && { id: next.id, titleEs: next.meta.titleEs },
    };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
});
