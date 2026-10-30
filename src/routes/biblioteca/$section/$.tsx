import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChildLessons, LessonFooter } from "@/components/lesson/lesson-nav";
import { mdxComponents } from "@/components/lesson/mdx-components";
import { WordList } from "@/components/lesson/word-list";
import { getLesson } from "@/content";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// Ruta "splat" ($): captura el resto de la URL, incluidas subcarpetas,
// p. ej. /biblioteca/grammar/adjectives/types-of-adjectives → _splat = "adjectives/types-of-adjectives".
export const Route = createFileRoute("/biblioteca/$section/$")({
  // El loader espera al cuerpo de la lección (MDX o JSON), que se descarga solo ahora
  loader: async ({ params }) => {
    const lesson = getLesson(params.section, params._splat ?? "");
    if (!lesson) throw notFound();
    const loaded = await lesson.load();
    return { crumb: lesson.meta.title, lesson, loaded };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: LessonPage,
});

function LessonPage() {
  const { lesson, loaded } = Route.useLoaderData();
  const parent = lesson.parent ? getParent(lesson.parent) : undefined;

  return (
    <article className="max-w-3xl">
      {parent && (
        <p className="mb-2 text-sm text-muted-foreground">
          {es.library.partOf}{" "}
          <Link
            to="/biblioteca/$section/$"
            params={{ section: parent.section, _splat: parent.slug }}
            lang="en"
            className="font-medium text-primary hover:underline"
          >
            {parent.meta.title}
          </Link>
        </p>
      )}
      <h1 lang="en" className="mb-6 font-heading text-3xl font-bold tracking-tight">
        {lesson.meta.title}
      </h1>
      {lesson.meta.summaryEs && <p className="mb-6 text-lg">{lesson.meta.summaryEs}</p>}

      <div className="mb-8">
        <ChildLessons lesson={lesson} />
      </div>

      {loaded.kind === "article" ? (
        // El contenido de las lecciones está en inglés
        <div lang="en">
          <loaded.Content components={mdxComponents} />
        </div>
      ) : (
        <WordList list={loaded.list} />
      )}

      <LessonFooter lesson={lesson} />
    </article>
  );
}

function getParent(path: string) {
  const [section = "", ...rest] = path.split("/");
  return getLesson(section, rest.join("/"));
}
