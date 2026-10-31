import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { getAllLessons } from "@/content";
import { es } from "@/i18n/es";

// Listas de vocabulario con traducción: cada una se puede practicar con ejercicios generados
export function VocabularyLists() {
  const lists = getAllLessons().filter((l) => l.translatedCount > 0);
  if (lists.length === 0) return <p className="text-muted-foreground">{es.flashcards.noDecks}</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <li key={list.path}>
          <Link
            to="/practicar/vocabulario"
            search={{ lista: list.path }}
            className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <span lang="en" className="font-semibold group-hover:underline">
              {list.meta.title}
            </span>
            <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {list.meta.level && <Badge variant="secondary">{list.meta.level}</Badge>}
              {es.library.wordsCount(list.translatedCount)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
