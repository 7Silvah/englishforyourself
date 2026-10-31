import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { getLessonByPath } from "@/content";
import { loadListPractice } from "@/features/exercises/list-practice";
import { VocabularyLists } from "@/features/exercises/vocabulary-lists";
import { VocabularyPractice } from "@/features/exercises/vocabulary-practice";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

type Search = { lista?: string };

// /practicar/vocabulario: elegir lista · /practicar/vocabulario?lista=…: ejercicios generados
export const Route = createFileRoute("/practicar/vocabulario")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    lista: typeof search.lista === "string" ? search.lista : undefined,
  }),
  loaderDeps: ({ search }) => ({ lista: search.lista }),
  loader: async ({ deps }) => {
    const crumb = es.generated.vocabulary.practice;
    if (!deps.lista) return { crumb, list: null };
    const lesson = getLessonByPath(deps.lista);
    const practice = lesson && (await loadListPractice(lesson));
    if (!lesson || !practice) throw notFound();
    return {
      crumb: `${crumb} · ${lesson.meta.title}`,
      list: {
        path: lesson.path,
        title: lesson.meta.title,
        level: lesson.meta.level ?? "A1",
        practice,
        hasFlashcards: lesson.translatedCount > 0,
      },
    };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: VocabularioPage,
});

function VocabularioPage() {
  const { list } = Route.useLoaderData();
  if (!list)
    return (
      <>
        <PageHeader
          title={es.generated.vocabulary.practice}
          description={es.generated.vocabulary.listsIntro}
        />
        <VocabularyLists />
      </>
    );
  return (
    <>
      <PageHeader
        title={es.generated.vocabulary.title(list.title)}
        description={es.generated.vocabulary.instruction}
      />
      {/* key: al cambiar de lista, la práctica empieza de cero */}
      <VocabularyPractice
        key={list.path}
        listPath={list.path}
        title={list.title}
        level={list.level}
        practice={list.practice}
        hasFlashcards={list.hasFlashcards}
      />
    </>
  );
}
