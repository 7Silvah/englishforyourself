import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { Layers, List, PencilLine } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getChildLessons, getSectionLessons, type LessonEntry } from "@/content";
import { VOCABULARY_SECTION, vocabularyTopics } from "@/features/vocabulary/lessons";
import {
  buildVocabulary,
  entriesOf,
  filterGroups,
  type VocabularySource,
} from "@/features/vocabulary/logic";
import { parseFilters, wordFilters } from "@/features/vocabulary/filters";
import { useVocabularyStore } from "@/features/vocabulary/store";
import { VocabularyTable } from "@/features/vocabulary/vocabulary-table";
import { es } from "@/i18n/es";

export const Route = createFileRoute("/biblioteca/$section/")({
  // Filtros de la tabla de Vocabulario: ?nivel=A2&tema=animals-vocabulary&tipo=noun&q=casa&fav=true&pagina=2
  validateSearch: parseFilters,
  // Vocabulario es una sola tabla con todas sus listas: se cargan todas aquí (cada una es
  // un chunk aparte). Las demás secciones solo listan sus lecciones.
  loader: async ({ params }) => ({
    // import(): cargar y unir el vocabulario no entra en la carga inicial de la app
    vocabulary:
      params.section === VOCABULARY_SECTION
        ? await (await import("@/features/vocabulary/load")).loadVocabulary()
        : null,
  }),
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

function VocabularyPage({ sources }: { sources: VocabularySource[] }) {
  const { section } = sectionRoute.useLoaderData();
  const filters = Route.useSearch();
  const favoriteIds = useVocabularyStore((state) => state.favorites);
  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  // Juntar y filtrar más de 4000 palabras cuesta: solo cuando cambian las fuentes o los filtros
  const groups = useMemo(() => buildVocabulary(sources), [sources]);
  const filtered = useMemo(
    () => filterGroups(groups, wordFilters(filters), favorites),
    [groups, filters, favorites],
  );
  const translated = entriesOf(filtered).filter((e) => e.es).length;
  // Las prácticas reciben los mismos filtros (sin la página): ?vocabulario=true&nivel=…
  const practice = { vocabulario: true as const, ...wordFilters(filters) };
  const t = es.library.vocabularyTable;

  return (
    <>
      <PageHeader
        title={section.titleEs}
        description={t.intro}
        actions={
          translated > 0 && (
            <>
              <Link
                to="/practicar/flashcards"
                search={practice}
                className={buttonVariants({ size: "lg" })}
              >
                <Layers data-icon="inline-start" aria-hidden />
                {t.practiceFlashcards(translated)}
              </Link>
              <Link
                to="/practicar/vocabulario"
                search={practice}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <PencilLine data-icon="inline-start" aria-hidden />
                {t.practiceQuiz}
              </Link>
            </>
          )
        }
      />
      <VocabularyTable
        groups={groups}
        filtered={filtered}
        topics={vocabularyTopics()}
        filters={filters}
        favorites={favorites}
      />
    </>
  );
}

function SectionPage() {
  const { section } = sectionRoute.useLoaderData();
  const { vocabulary } = Route.useLoaderData();
  if (vocabulary) return <VocabularyPage sources={vocabulary} />;
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
