import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenText,
  Clock,
  Combine,
  Languages,
  MessagesSquare,
  Puzzle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { getAllLessons } from "@/content";
import { sections, type SectionSlug } from "@/content/sections";
import { es } from "@/i18n/es";

export const Route = createFileRoute("/biblioteca/")({
  component: LibraryPage,
});

const sectionIcons: Record<SectionSlug, LucideIcon> = {
  "verb-tenses": Clock,
  grammar: BookOpenText,
  vocabulary: Languages,
  "ways-to-say": MessagesSquare,
  "phrasal-verbs": Puzzle,
  collocations: Combine,
  idioms: Sparkles,
};

function LibraryPage() {
  return (
    <>
      <PageHeader title={es.library.title} description={es.library.description} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = sectionIcons[section.slug];
          return (
            <li key={section.slug}>
              <Link
                to="/biblioteca/$section"
                params={{ section: section.slug }}
                className="group flex h-full gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <Icon className="size-6 shrink-0 text-primary" aria-hidden />
                <div>
                  <h2 className="font-heading font-semibold group-hover:text-primary">
                    {section.titleEs}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{section.descriptionEs}</p>
                  <p className="mt-2 text-xs font-medium text-primary">
                    {es.library.lessonsCount(
                      getAllLessons().filter((l) => l.section === section.slug).length,
                    )}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
