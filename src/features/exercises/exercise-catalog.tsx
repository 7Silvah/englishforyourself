import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { filterChip, segmentedItem } from "@/components/shared/filter-styles";
import { LevelBadge } from "@/components/shared/level-badge";
import { SectionCard } from "@/components/shared/section-card";
import { Segmented } from "@/components/shared/segmented";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllExerciseSets, getExerciseSetSection } from "@/content";
import type { Level } from "@/content/schema";
import { IRREGULAR_TOPIC } from "@/content/data/practice-topics";
import { LEVELS } from "@/content/levels";
import { getSection } from "@/content/sections";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";

const t = es.exercises;
const OTHER = "otros";

export type CatalogFilters = { nivel?: Level; tema?: string };

const COURSE = "curso";

// Tema de un set: "curso" si es de una unidad; si no, la sección de su lección
function topicOf(set: ReturnType<typeof getAllExerciseSets>[number]): string {
  if (set.meta.unit) return COURSE;
  return getExerciseSetSection(set) ?? OTHER;
}

// Un filtro es un enlace (el estado vive en la URL), con el estilo común de U2
function FilterLink({
  search,
  active,
  children,
}: {
  search: CatalogFilters;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      to="/ejercicios"
      search={search}
      aria-current={active ? "true" : undefined}
      className={segmentedItem({ active })}
    >
      {children}
    </Link>
  );
}

export function ExerciseCatalog({ filters }: { filters: CatalogFilters }) {
  const attempts = useProgressStore((state) => state.attempts);
  const sets = getAllExerciseSets();

  // Solo se ofrecen los filtros que tienen algún set
  const levels = LEVELS.filter((level) => sets.some((s) => s.meta.level === level));
  const topics = [...new Set(sets.map(topicOf))];
  const visible = sets.filter(
    (s) =>
      (!filters.nivel || s.meta.level === filters.nivel) &&
      (!filters.tema || topicOf(s) === filters.tema),
  );

  const topicLabel = (slug: string) =>
    slug === OTHER
      ? t.filters.other
      : slug === COURSE
        ? es.nav.course
        : (getSection(slug)?.titleEs ?? slug);

  // Chips de «Filtros aplicados»: cada uno es un enlace que quita su filtro
  const chips: { label: string; search: CatalogFilters }[] = [];
  if (filters.nivel)
    chips.push({ label: es.filters.chipLevel(filters.nivel), search: { tema: filters.tema } });
  if (filters.tema)
    chips.push({
      label: es.filters.chipTopic(topicLabel(filters.tema)),
      search: { nivel: filters.nivel },
    });

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="generated"
        className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3"
      >
        <h2 id="generated" className="mr-auto flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" aria-hidden />
          {t.generated}
        </h2>
        <Link
          to="/ejercicios/practicar/$tema"
          params={{ tema: IRREGULAR_TOPIC }}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {es.generated.irregular.title}
        </Link>
        <Link
          to="/herramientas/tense-lab"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {t.generatedTenses}
        </Link>
        <Link
          to="/practicar/vocabulario"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {es.generated.vocabulary.vocabularyTitle}
        </Link>
        <Link
          to="/practicar/flashcards"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {es.flashcards.title}
        </Link>
      </section>
      <SectionCard className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Segmented label={t.filters.level}>
            <FilterLink search={{ tema: filters.tema }} active={!filters.nivel}>
              {t.filters.all}
            </FilterLink>
            {levels.map((level) => (
              <FilterLink
                key={level}
                search={{ ...filters, nivel: level }}
                active={filters.nivel === level}
              >
                {level}
              </FilterLink>
            ))}
          </Segmented>
          {topics.length > 1 && (
            <Segmented label={t.filters.topic}>
              <FilterLink search={{ nivel: filters.nivel }} active={!filters.tema}>
                {t.filters.all}
              </FilterLink>
              {topics.map((topic) => (
                <FilterLink
                  key={topic}
                  search={{ ...filters, tema: topic }}
                  active={filters.tema === topic}
                >
                  {topicLabel(topic)}
                </FilterLink>
              ))}
            </Segmented>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {chips.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">{es.filters.applied}</span>
                {chips.map((chip) => (
                  <Link
                    key={chip.label}
                    to="/ejercicios"
                    search={chip.search}
                    aria-label={es.filters.removeFilter(chip.label)}
                    className={filterChip()}
                  >
                    {chip.label}
                    <X aria-hidden />
                  </Link>
                ))}
                <Link to="/ejercicios" className={buttonVariants({ variant: "link", size: "sm" })}>
                  {es.filters.resetAll}
                </Link>
              </>
            )}
          </div>
          {/* aria-live: el lector de pantalla anuncia cuántos sets quedan al filtrar */}
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {t.showing(visible.length, sets.length)}
          </p>
        </div>
      </SectionCard>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((set) => {
            const best = attempts[set.id]?.best;
            return (
              <li key={set.id}>
                <Link to="/ejercicios/$id" params={{ id: set.id }} className="group block h-full">
                  <Card size="sm" className="h-full transition-colors group-hover:bg-muted/50">
                    <CardHeader>
                      <CardTitle className="group-hover:underline">{set.meta.titleEs}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <LevelBadge level={set.meta.level} />
                        <span>{t.itemsCount(set.itemCount)}</span>
                        {set.meta.source === "original" && (
                          <Badge variant="outline">{t.original}</Badge>
                        )}
                        {best !== undefined && <Badge variant="outline">{t.best(best)}</Badge>}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
