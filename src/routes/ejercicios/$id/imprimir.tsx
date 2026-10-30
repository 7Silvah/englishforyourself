import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { PrintSheet } from "@/features/exercises/print-sheet";
import { es } from "@/i18n/es";

const setRoute = getRouteApi("/ejercicios/$id");

export const Route = createFileRoute("/ejercicios/$id/imprimir")({
  loader: () => ({ crumb: es.exercises.printVersion }),
  component: PrintPage,
});

function PrintPage() {
  const { set } = setRoute.useLoaderData();
  const { id } = Route.useParams();
  return <PrintSheet id={id} set={set} />;
}
