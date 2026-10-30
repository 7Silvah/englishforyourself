import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressOverview } from "@/features/progress/progress-overview";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/progreso")({
  loader: () => ({ crumb: es.nav.progress }),
  head: () => ({ meta: [{ title: pageTitle(es.nav.progress) }] }),
  component: ProgressPage,
});

function ProgressPage() {
  return (
    <>
      <PageHeader title={es.progress.title} description={es.progress.description} />
      <ProgressOverview />
    </>
  );
}
