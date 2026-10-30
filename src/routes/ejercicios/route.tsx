import { createFileRoute } from "@tanstack/react-router";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/ejercicios")({
  loader: () => ({ crumb: es.nav.exercises }),
  head: () => ({ meta: [{ title: pageTitle(es.nav.exercises) }] }),
});
