import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Library, PencilLine, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const pillars: {
  to: "/curso" | "/ejercicios" | "/biblioteca";
  Icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  { to: "/curso", Icon: GraduationCap, ...es.home.pillars.course },
  { to: "/ejercicios", Icon: PencilLine, ...es.home.pillars.exercises },
  { to: "/biblioteca", Icon: Library, ...es.home.pillars.library },
];

function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-6 py-8 text-center sm:py-12">
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {es.home.title}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{es.home.intro}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/curso" className={buttonVariants({ size: "lg" })}>
            {es.home.startCourse}
          </Link>
          <Link to="/biblioteca" className={buttonVariants({ size: "lg", variant: "outline" })}>
            {es.home.browseLibrary}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map(({ to, Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "group rounded-xl border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-muted/40",
            )}
          >
            <Icon className="mb-4 size-8 text-primary" aria-hidden />
            <h2 className="font-heading text-lg font-semibold group-hover:text-primary">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
