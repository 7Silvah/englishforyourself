import { createFileRoute, notFound } from "@tanstack/react-router";
import { getUnit } from "@/content";
import { UnitView } from "@/features/course/unit-view";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/curso/$unidad")({
  loader: async ({ params }) => {
    const unit = getUnit(params.unidad);
    if (!unit) throw notFound();
    return {
      crumb: `${es.course.unitN(unit.meta.number)}: ${unit.meta.titleEs}`,
      slug: unit.slug,
      Content: await unit.load(),
    };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: UnitPage,
});

function UnitPage() {
  const { slug, Content } = Route.useLoaderData();
  const unit = getUnit(slug);
  if (!unit) return null;
  return <UnitView key={slug} unit={unit} Content={Content} />;
}
