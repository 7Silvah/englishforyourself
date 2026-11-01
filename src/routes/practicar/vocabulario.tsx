import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { getLessonByPath } from "@/content";
import { LEVELS } from "@/content/levels";
import { loadListPractice } from "@/features/exercises/list-practice";
import { VocabularyLists } from "@/features/exercises/vocabulary-lists";
import { VocabularyPractice } from "@/features/exercises/vocabulary-practice";
import { parsePracticeSearch } from "@/features/vocabulary/filters";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// /practicar/vocabulario: elegir lista · ?lista=…: ejercicios generados de una lista ·
// ?vocabulario=true&nivel=…: ejercicios con lo filtrado en la tabla de Vocabulario
export const Route = createFileRoute("/practicar/vocabulario")({
  validateSearch: parsePracticeSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const crumb = es.generated.vocabulary.practice;
    if (deps.vocabulario) {
      // import() dinámico: unir y filtrar el vocabulario solo se descarga al practicarlo
      const { filterLabels, loadFilteredEntries } = await import("@/features/vocabulary/load");
      const { lista: _lista, ...filters } = deps;
      const title = es.library.vocabularyTable.filteredTitle(filterLabels(filters));
      const words = (await loadFilteredEntries(filters)).flatMap(({ en, es: tr, level }) =>
        tr ? [{ en, es: tr, level }] : [],
      );
      // El nivel del set: el elegido o, si no, el más frecuente entre las palabras
      const level =
        filters.nivel ??
        LEVELS.reduce((best, l) =>
          words.filter((w) => w.level === l).length > words.filter((w) => w.level === best).length
            ? l
            : best,
        );
      return {
        crumb: `${crumb} · ${title}`,
        list: {
          id: JSON.stringify(filters),
          title,
          level,
          practice: { kind: "vocabulary" as const, words },
          flashcards: words.length > 0 ? filters : undefined,
        },
      };
    }
    if (!deps.lista) return { crumb, list: null };
    const lesson = getLessonByPath(deps.lista);
    const practice = lesson && (await loadListPractice(lesson));
    if (!lesson || !practice) throw notFound();
    return {
      crumb: `${crumb} · ${lesson.meta.title}`,
      list: {
        id: lesson.path,
        title: lesson.meta.title,
        level: lesson.meta.level ?? "A1",
        practice,
        flashcards: lesson.translatedCount > 0 ? { lista: lesson.path } : undefined,
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
      {/* key: al cambiar de lista o de filtros, la práctica empieza de cero */}
      <VocabularyPractice
        key={list.id}
        id={list.id}
        title={list.title}
        level={list.level}
        practice={list.practice}
        flashcards={list.flashcards}
      />
    </>
  );
}
