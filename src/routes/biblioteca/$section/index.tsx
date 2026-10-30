import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { List } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { getChildLessons, getSectionLessons, type LessonEntry } from "@/content";
import { es } from "@/i18n/es";

export const Route = createFileRoute("/biblioteca/$section/")({
  component: SectionPage,
});

// Lee los datos que cargó la ruta padre (/biblioteca/$section)
const sectionRoute = getRouteApi("/biblioteca/$section");

function LessonItem({ lesson }: { lesson: LessonEntry }) {
  const children = getChildLessons(lesson.path);
  return (
    <li className="rounded-lg border bg-card">
      <Link
        to="/biblioteca/$section/$"
        params={{ section: lesson.section, _splat: lesson.slug }}
        className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <span lang="en" className="font-medium">
          {lesson.meta.title}
        </span>
        {lesson.meta.kind === "wordlist" && (
          <Badge variant="secondary" className="shrink-0">
            <List aria-hidden />
            {es.library.wordsCount(lesson.wordCount)}
          </Badge>
        )}
      </Link>
      {children.length > 0 && (
        <ul className="space-y-0.5 border-t px-4 py-2">
          {children.map((child) => (
            <li key={child.path}>
              <Link
                to="/biblioteca/$section/$"
                params={{ section: child.section, _splat: child.slug }}
                lang="en"
                className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {child.meta.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SectionPage() {
  const { section } = sectionRoute.useLoaderData();
  const lessons = getSectionLessons(section.slug);

  return (
    <>
      <PageHeader title={section.titleEs} description={section.descriptionEs} />
      {lessons.length === 0 ? (
        <p className="text-muted-foreground">{es.library.emptySection}</p>
      ) : (
        <ul className="grid items-start gap-3 md:grid-cols-2">
          {lessons.map((lesson) => (
            <LessonItem key={lesson.path} lesson={lesson} />
          ))}
        </ul>
      )}
    </>
  );
}
