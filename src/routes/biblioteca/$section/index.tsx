import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/biblioteca/$section/")({
  component: SectionPage,
});

// Lee los datos que cargó la ruta padre (/biblioteca/$section)
const sectionRoute = getRouteApi("/biblioteca/$section");

function SectionPage() {
  const { section } = sectionRoute.useLoaderData();
  return (
    <>
      <PageHeader title={section.titleEs} description={section.descriptionEs} />
      <ComingSoon phase="F4" />
    </>
  );
}
