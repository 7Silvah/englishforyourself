import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { getLessonByPath } from "@/content";
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
    if (!lesson || lesson.translatedCount === 0) throw notFound();
    const loaded = await lesson.load();
    if (loaded.kind !== "wordlist") throw notFound();
    const words = loaded.list.groups.flatMap((g) =>
      g.items.flatMap((w) => (w.es ? [{ en: w.en, es: w.es }] : [])),
    );
    return {
      crumb: `${crumb} · ${lesson.meta.title}`,
      list: {
        path: lesson.path,
        title: lesson.meta.title,
        level: lesson.meta.level ?? "A1",
        words,
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
          description={es.generated.vocabulary.instruction}
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
        words={list.words}
      />
    </>
  );
}
