import { Link } from "@tanstack/react-router";
import { es } from "@/i18n/es";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{es.footer.madeFor}</p>
        <Link to="/acerca" className="hover:text-foreground">
          {es.nav.about}
        </Link>
      </div>
    </footer>
  );
}
