import { createFileRoute, lazyRouteComponent, notFound } from "@tanstack/react-router";

// Contenido pendiente de revisión (D1). Solo existe en desarrollo, como /dev/ui:
// en el build, import.meta.env.DEV es false y el import de la página desaparece.
export const Route = createFileRoute("/dev/revision")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: import.meta.env.DEV
    ? lazyRouteComponent(() => import("@/dev/revision-page"), "RevisionPage")
    : () => null,
});
