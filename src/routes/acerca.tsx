import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/acerca")({
  loader: () => ({ crumb: es.nav.about }),
  head: () => ({ meta: [{ title: pageTitle(es.nav.about) }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title={es.about.title} />
      <div className="space-y-4 text-muted-foreground">
        {es.about.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
