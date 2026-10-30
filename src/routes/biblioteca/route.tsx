import { createFileRoute } from "@tanstack/react-router";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/biblioteca")({
  loader: () => ({ crumb: es.nav.library }),
  head: () => ({ meta: [{ title: pageTitle(es.nav.library) }] }),
});
