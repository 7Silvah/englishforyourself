import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NotFound } from "@/components/layout/not-found";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// Panel para inspeccionar rutas, parámetros y loaders. Solo en desarrollo.
const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;

export const Route = createRootRoute({
  loader: () => ({ crumb: es.nav.home }),
  head: () => ({ meta: [{ title: pageTitle() }] }),
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {es.a11y.skipToContent}
      </a>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <Breadcrumbs />
        <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Suspense>
        <RouterDevtools position="bottom-left" />
      </Suspense>
    </>
  );
}
