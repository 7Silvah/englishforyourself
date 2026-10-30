import { lazy, Suspense } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { es } from "@/i18n/es";

// Solo en desarrollo: import.meta.env.DEV es false en el build y Vite elimina esta rama.
const UiShowcase = import.meta.env.DEV
  ? lazy(() => import("@/dev/ui-showcase").then((m) => ({ default: m.UiShowcase })))
  : null;

// Página provisional. En F3 la sustituye el router.
export function App() {
  if (UiShowcase && window.location.pathname === "/_dev/ui") {
    return (
      <Suspense>
        <UiShowcase />
      </Suspense>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-16">
      <div className="flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-xl bg-linear-to-br from-primary to-brand font-bold text-white">
          EfY
        </span>
        <ThemeToggle />
      </div>
      <h1 className="font-heading text-3xl font-bold">{es.app.name}</h1>
      <p className="text-lg">{es.app.tagline}</p>
      <p className="text-muted-foreground">{es.app.underConstruction}</p>
    </main>
  );
}
