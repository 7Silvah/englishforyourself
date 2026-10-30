import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { es } from "@/i18n/es";

export const Route = createFileRoute("/curso/")({
  component: CoursePage,
});

function CoursePage() {
  return (
    <>
      <PageHeader title={es.course.title} description={es.course.description} />
      <ComingSoon phase="F6" />
    </>
  );
}
