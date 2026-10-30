import { createFileRoute, lazyRouteComponent, notFound } from "@tanstack/react-router";

// Página de muestra del sistema de diseño. Solo existe en desarrollo:
// en el build, import.meta.env.DEV es false y el import de la página desaparece.
export const Route = createFileRoute("/dev/ui")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: import.meta.env.DEV
    ? lazyRouteComponent(() => import("@/dev/ui-showcase"), "UiShowcase")
    : () => null,
});
