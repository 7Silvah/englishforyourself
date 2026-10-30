import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { CourseMap } from "@/features/course/course-map";
import { es } from "@/i18n/es";

export const Route = createFileRoute("/curso/")({
  component: CoursePage,
});

function CoursePage() {
  return (
    <>
      <PageHeader title={es.course.title} description={es.course.description} />
      <CourseMap />
    </>
  );
}
