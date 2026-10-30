import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { es } from "@/i18n/es";

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <p className="font-heading text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="font-heading text-2xl font-bold">{es.notFound.title}</h1>
      <p className="text-muted-foreground">{es.notFound.description}</p>
      <Link to="/" className={buttonVariants()}>
        {es.notFound.backHome}
      </Link>
    </div>
  );
}
