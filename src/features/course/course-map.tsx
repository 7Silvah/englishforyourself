import { Link } from "@tanstack/react-router";
import { LevelHeading } from "@/components/shared/level-heading";
import { LEVEL_TONE } from "@/components/shared/level-styles";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getUnits } from "@/content";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { groupByLevel, recommendedUnit, shownStatus } from "./logic";
import { UnitStatusBadge } from "./unit-status-badge";

// Mapa del curso: todas las unidades por nivel (un bloque por nivel), con su estado y la recomendada
export function CourseMap() {
  const attempts = useProgressStore((state) => state.attempts);
  const placement = useProgressStore((state) => state.placement?.unit ?? null);
  const units = getUnits();
  const recommended = recommendedUnit(units, attempts, placement);
  const placed = units.find((u) => u.slug === placement);
  const current = recommended?.meta.level;

  return (
    <div className="space-y-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-muted-foreground">{es.course.intro}</p>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
          <p className="flex-1">
            {current && (
              <strong className="mb-1 block">
                <LevelHeading level={current} prefix={es.course.youAreIn} />
              </strong>
            )}
            {placed
              ? es.course.placementDone(placed.meta.number, placed.meta.titleEs)
              : es.course.placementCta}
          </p>
          <Link to="/prueba-de-nivel" className={buttonVariants({ variant: "outline" })}>
            {placed ? es.course.placementRetry : es.course.placementStart}
          </Link>
        </div>
      </div>
      {groupByLevel(units).map(([level, blockUnits]) => (
        <section key={level} aria-labelledby={`block-${level}`} className="space-y-4">
          <div className="space-y-1">
            <h2 id={`block-${level}`} className="font-heading text-xl font-semibold">
              <LevelHeading level={level} />
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {es.course.levels[level].goal}
            </p>
          </div>
          <ol className="grid gap-3 md:grid-cols-2">
            {blockUnits.map((unit) => {
              const isRecommended = unit === recommended;
              return (
                <li key={unit.slug}>
                  <Link
                    to="/curso/$unidad"
                    params={{ unidad: unit.slug }}
                    className={cn(
                      "group flex h-full gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50",
                      isRecommended && "border-primary ring-1 ring-primary",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full border font-heading text-lg font-bold",
                        LEVEL_TONE[level],
                      )}
                    >
                      {unit.meta.number}
                    </span>
                    <span className="flex-1 space-y-1">
                      <span className="sr-only">{es.course.unitN(unit.meta.number)}: </span>
                      <span className="block font-semibold group-hover:underline">
                        {unit.meta.titleEs}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {unit.meta.summaryEs}
                      </span>
                      <span className="flex flex-wrap gap-2 pt-1">
                        <UnitStatusBadge status={shownStatus(unit, units, attempts, placement)} />
                        {isRecommended && <Badge>{es.course.recommended}</Badge>}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
