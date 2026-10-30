import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageHeader } from "@/components/layout/page-header";
import { es } from "@/i18n/es";

export const Route = createFileRoute("/ejercicios/")({
  component: ExercisesPage,
});

function ExercisesPage() {
  return (
    <>
      <PageHeader title={es.exercises.title} description={es.exercises.description} />
      <ComingSoon phase="F5" />
    </>
  );
}
