import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getAllLessons } from "@/content";
import { dayKey } from "@/features/progress/logic";
import { es } from "@/i18n/es";
import { seenStats } from "./logic";
import { useFlashcardStore } from "./store";

const t = es.flashcards;

// Lista de mazos: cada lista de vocabulario con traducciones es un mazo de tarjetas.
// Los números salen de los metadatos y del store: no hace falta cargar las palabras.
export function FlashcardDecks() {
  const states = useFlashcardStore((state) => state.cards);
  // "Hoy" se calcula una vez (inicializador de useState): leer la fecha en cada render es impuro
  const [today] = useState(() => dayKey(new Date()));
  const decks = getAllLessons().filter((l) => l.translatedCount > 0);

  if (decks.length === 0) return <p className="text-muted-foreground">{t.noDecks}</p>;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => {
        const stats = seenStats(deck.path, deck.translatedCount, states, today);
        return (
          <li key={deck.path}>
            <Link
              to="/practicar/flashcards"
              search={{ lista: deck.path }}
              className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <span className="font-semibold group-hover:underline" lang="en">
                {deck.meta.title}
              </span>
              <span className="text-sm text-muted-foreground">{t.cards(deck.translatedCount)}</span>
              <span className="flex flex-wrap gap-1.5">
                {stats.due > 0 && <Badge>{t.due(stats.due)}</Badge>}
                {stats.fresh > 0 && <Badge variant="secondary">{t.fresh(stats.fresh)}</Badge>}
                {stats.mastered > 0 && (
                  <Badge variant="outline">{t.mastered(stats.mastered)}</Badge>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
