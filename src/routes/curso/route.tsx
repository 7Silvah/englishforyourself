import { createFileRoute } from "@tanstack/react-router";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// Ruta "contenedora" de /curso/*: aporta la miga "Curso" y renderiza la página hija.
export const Route = createFileRoute("/curso")({
  loader: () => ({ crumb: es.nav.course }),
  head: () => ({ meta: [{ title: pageTitle(es.nav.course) }] }),
});
