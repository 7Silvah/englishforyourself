import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { getAllLessons } from "@/content";
import { getSection } from "@/content/sections";
import { es } from "@/i18n/es";
import { canPractice, PRACTICE_SECTIONS } from "./list-practice";

// Listas de la Biblioteca que se pueden practicar con ejercicios generados, por sección
export function VocabularyLists() {
  const lists = getAllLessons().filter(canPractice);
  if (lists.length === 0) return <p className="text-muted-foreground">{es.flashcards.noDecks}</p>;
  return (
    <div className="space-y-8">
      {PRACTICE_SECTIONS.map((slug) => {
        const inSection = lists.filter((l) => l.section === slug);
        if (inSection.length === 0) return null;
        return (
          <section key={slug} className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">{getSection(slug)?.titleEs}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inSection.map((list) => (
                <li key={list.path}>
                  <Link
                    to="/practicar/vocabulario"
                    search={{ lista: list.path }}
                    className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <span lang="en" className="font-semibold group-hover:underline">
                      {list.meta.title}
                    </span>
                    {list.meta.titleEs && <span className="text-sm">{list.meta.titleEs}</span>}
                    <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {list.meta.level && <Badge variant="secondary">{list.meta.level}</Badge>}
                      {list.translatedCount > 0
                        ? es.library.wordsCount(list.translatedCount)
                        : es.generated.vocabulary.itemsCount(list.wordCount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
