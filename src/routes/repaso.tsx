import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewPage } from "@/features/review/review-page";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/repaso")({
  loader: () => ({ crumb: es.review.title }),
  head: () => ({ meta: [{ title: pageTitle(es.review.title) }] }),
  component: RepasoPage,
});

function RepasoPage() {
  return (
    <>
      <PageHeader title={es.review.title} description={es.review.description} />
      <ReviewPage />
    </>
  );
}
