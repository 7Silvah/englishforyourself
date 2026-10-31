import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { getLessonByPath } from "@/content";
import { FlashcardDecks } from "@/features/flashcards/flashcard-decks";
import { FlashcardSession } from "@/features/flashcards/flashcard-session";
import { cardKey } from "@/features/flashcards/logic";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

type Search = { lista?: string };

export const Route = createFileRoute("/practicar/flashcards")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    lista: typeof search.lista === "string" ? search.lista : undefined,
  }),
  // loaderDeps: el loader depende de ?lista=, así se vuelve a ejecutar al cambiar de lista
  loaderDeps: ({ search }) => ({ lista: search.lista }),
  loader: async ({ deps }) => {
    if (!deps.lista) return { crumb: es.flashcards.title, deck: null };
    const lesson = getLessonByPath(deps.lista);
    if (!lesson || lesson.translatedCount === 0) throw notFound();
    const loaded = await lesson.load();
    if (loaded.kind !== "wordlist") throw notFound();
    const cards = loaded.list.groups.flatMap((g) =>
      g.items.flatMap((w) =>
        w.es ? [{ key: cardKey(lesson.path, w.en), en: w.en, es: w.es }] : [],
      ),
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
  const { lista } = Route.useSearch();
  if (!lista || !deck)
    return (
      <>
        <PageHeader title={es.flashcards.title} description={es.flashcards.description} />
        <FlashcardDecks />
      </>
    );
  return (
    <>
      <PageHeader title={deck.title} description={es.flashcards.sessionHint} />
      {/* key: al cambiar de lista, la sesión empieza de cero */}
      <FlashcardSession key={lista} cards={deck.cards} />
    </>
  );
}
