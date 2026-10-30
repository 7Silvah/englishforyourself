import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllExerciseSets, getExerciseSetSection } from "@/content";
import type { Level } from "@/content/schema";
import { LEVELS } from "@/content/levels";
import { getSection } from "@/content/sections";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";

const t = es.exercises;
const OTHER = "otros";

export type CatalogFilters = { nivel?: Level; tema?: string };

const COURSE = "curso";

// Tema de un set: "curso" si es de una unidad; si no, la sección de su lección
function topicOf(set: ReturnType<typeof getAllExerciseSets>[number]): string {
  if (set.meta.unit) return COURSE;
  return getExerciseSetSection(set) ?? OTHER;
}

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
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted",
        active && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
      )}
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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div
          role="group"
          aria-label={t.filters.level}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="w-16 text-sm font-medium">{t.filters.level}</span>
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
        </div>
        {topics.length > 1 && (
          <div
            role="group"
            aria-label={t.filters.topic}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="w-16 text-sm font-medium">{t.filters.topic}</span>
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
          </div>
        )}
      </div>

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
                        <Badge variant="secondary">{set.meta.level}</Badge>
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
