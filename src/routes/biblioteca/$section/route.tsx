import { createFileRoute, notFound } from "@tanstack/react-router";
import { getSection } from "@/content/sections";
import { pageTitle } from "@/lib/page-title";

// Valida la sección una sola vez para /biblioteca/$section y todas sus lecciones.
export const Route = createFileRoute("/biblioteca/$section")({
  loader: ({ params }) => {
    const section = getSection(params.section);
    if (!section) throw notFound();
    return { crumb: section.titleEs, section };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
});
