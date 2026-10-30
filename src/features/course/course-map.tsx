import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { getUnits, type UnitEntry } from "@/content";
import type { UnitBlock } from "@/content/schema";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { recommendedUnit, unitStatus } from "./logic";
import { UnitStatusBadge } from "./unit-status-badge";

// Mapa del curso: todas las unidades por bloque, con su estado y la recomendada
export function CourseMap() {
  const attempts = useProgressStore((state) => state.attempts);
  const units = getUnits();
  const recommended = recommendedUnit(units, attempts);

  const blocks = new Map<UnitBlock, UnitEntry[]>();
  for (const unit of units)
    blocks.set(unit.meta.block, [...(blocks.get(unit.meta.block) ?? []), unit]);

  return (
    <div className="space-y-10">
      <p className="max-w-3xl text-muted-foreground">{es.course.intro}</p>
      {[...blocks].map(([block, blockUnits]) => (
        <section key={block} aria-labelledby={`block-${block}`} className="space-y-4">
          <h2 id={`block-${block}`} className="font-heading text-xl font-semibold">
            {es.course.blocks[block]} · {blockUnits[0]?.meta.level}
          </h2>
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
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-lg font-bold"
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
                        <UnitStatusBadge status={unitStatus(unit.meta, attempts)} />
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
