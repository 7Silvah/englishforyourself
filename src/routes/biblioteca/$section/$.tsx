import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { Layers, PencilLine } from "lucide-react";
import { ChildLessons, LessonFooter } from "@/components/lesson/lesson-nav";
import { mdxComponents } from "@/components/lesson/mdx-components";
import { WordList } from "@/components/lesson/word-list";
import { buttonVariants } from "@/components/ui/button";
import { getLesson } from "@/content";
import { canPractice } from "@/features/exercises/list-practice";
import { VOCABULARY_SECTION, vocabularyRedirect } from "@/features/vocabulary/lessons";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// Ruta "splat" ($): captura el resto de la URL, incluidas subcarpetas,
// p. ej. /biblioteca/grammar/adjectives/types-of-adjectives → _splat = "adjectives/types-of-adjectives".
export const Route = createFileRoute("/biblioteca/$section/$")({
  // El loader espera al cuerpo de la lección (MDX o JSON), que se descarga solo ahora
  loader: async ({ params }) => {
    const lesson = getLesson(params.section, params._splat ?? "");
    if (!lesson) throw notFound();
    // Las listas de vocabulario se ven en la tabla de la sección, filtrada por su tema (o
    // su nivel, las de Face2Face). Así sus URLs de siempre siguen funcionando.
    if (lesson.section === VOCABULARY_SECTION)
      throw redirect({
        to: "/biblioteca/$section",
        params: { section: lesson.section },
        search: vocabularyRedirect(lesson),
        replace: true,
      });
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

      <div className="mb-8 space-y-4">
        <ChildLessons lesson={lesson} />
        {(lesson.translatedCount > 0 || canPractice(lesson)) && (
          <div className="flex flex-wrap gap-2">
            {lesson.translatedCount > 0 && (
              <Link
                to="/practicar/flashcards"
                search={{ lista: lesson.path }}
                className={buttonVariants({ variant: "outline" })}
              >
                <Layers data-icon="inline-start" aria-hidden />
                {es.flashcards.practiceList(lesson.translatedCount)}
              </Link>
            )}
            {canPractice(lesson) && (
              <Link
                to="/practicar/vocabulario"
                search={{ lista: lesson.path }}
                className={buttonVariants({ variant: "outline" })}
              >
                <PencilLine data-icon="inline-start" aria-hidden />
                {es.generated.vocabulary.practice}
              </Link>
            )}
          </div>
        )}
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
