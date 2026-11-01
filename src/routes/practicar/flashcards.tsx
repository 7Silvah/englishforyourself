import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { getLessonByPath } from "@/content";
import { FlashcardDecks } from "@/features/flashcards/flashcard-decks";
import { FlashcardSession } from "@/features/flashcards/flashcard-session";
import { deckCards, mixedDeckCards } from "@/features/flashcards/logic";
import { parsePracticeSearch } from "@/features/vocabulary/filters";
import { VOCABULARY_SECTION } from "@/features/vocabulary/lessons";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// /practicar/flashcards: elegir mazo · ?lista=…: una lista · ?vocabulario=true&nivel=…: lo
// filtrado en la tabla de Vocabulario (cada tarjeta con la clave de su lista principal)
export const Route = createFileRoute("/practicar/flashcards")({
  validateSearch: parsePracticeSearch,
  // loaderDeps: el loader depende de la búsqueda, así se vuelve a ejecutar al cambiarla
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (deps.vocabulario) {
      // import() dinámico: unir y filtrar el vocabulario solo se descarga al practicarlo,
      // no en la carga inicial de la app
      const { filterLabels, loadFilteredEntries } = await import("@/features/vocabulary/load");
      const title = es.library.vocabularyTable.filteredTitle(filterLabels(deps));
      const entries = await loadFilteredEntries(deps);
      const cards = mixedDeckCards(
        entries.map((e) => ({ ...e, listPath: `${VOCABULARY_SECTION}/${e.home}` })),
      );
      return { crumb: `${es.flashcards.title} · ${title}`, deck: { title, cards } };
    }
    if (!deps.lista) return { crumb: es.flashcards.title, deck: null };
    const lesson = getLessonByPath(deps.lista);
    if (!lesson || lesson.translatedCount === 0) throw notFound();
    const loaded = await lesson.load();
    if (loaded.kind !== "wordlist") throw notFound();
    const cards = deckCards(
      lesson.path,
      loaded.list.groups.flatMap((g) => g.items),
    );
    return {
      crumb: `${es.flashcards.title} · ${lesson.meta.title}`,
      deck: { title: lesson.meta.title, cards },
    };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { deck } = Route.useLoaderData();
  const search = Route.useSearch();
  if (!deck)
    return (
      <>
        <PageHeader title={es.flashcards.title} description={es.flashcards.description} />
        <FlashcardDecks />
      </>
    );
  return (
    <>
      <PageHeader title={deck.title} description={es.flashcards.sessionHint} />
      {/* key: al cambiar de lista o de filtros, la sesión empieza de cero */}
      <FlashcardSession key={JSON.stringify(search)} cards={deck.cards} />
    </>
  );
}
