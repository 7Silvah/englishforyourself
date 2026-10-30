import { Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import type { Mode } from "./player/logic";
import type { ExerciseSet } from "./schema";

const t = es.exercises;

// Nivel, número de ítems, mejor nota, selector de modo y enlace a la versión imprimible
export function ExerciseSetInfo({
  id,
  set,
  mode,
  unit,
}: {
  id: string;
  set: ExerciseSet;
  mode: Mode;
  unit?: { slug: string; number: number; titleEs: string };
}) {
  const best = useProgressStore((state) => state.attempts[id]?.best);

  const modes = [
    { mode: "practice", label: t.mode.practice, search: {} },
    { mode: "exam", label: t.mode.exam, search: { modo: "examen" as const } },
  ] as const;

  return (
    <div className="space-y-4 pt-2">
      {unit && (
        <Link
          to="/curso/$unidad"
          params={{ unidad: unit.slug }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {es.course.backToUnit}: {es.course.unitN(unit.number)} · {unit.titleEs}
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{set.level}</Badge>
        <span>{t.itemsCount(set.items.length)}</span>
        {best !== undefined && <Badge variant="outline">{t.best(best)}</Badge>}
        <Link
          to="/ejercicios/$id/imprimir"
          params={{ id }}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto")}
        >
          <Printer data-icon="inline-start" aria-hidden />
          {t.printVersion}
        </Link>
      </div>
      <nav aria-label={t.mode.label} className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg bg-muted p-1">
          {modes.map((m) => (
            <Link
              key={m.mode}
              to="/ejercicios/$id"
              params={{ id }}
              search={m.search}
              aria-current={m.mode === mode ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors",
                m.mode === mode && "bg-background text-foreground shadow-sm",
              )}
            >
              {m.label}
            </Link>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {mode === "exam" ? t.mode.examHint : t.mode.practiceHint}
        </span>
      </nav>
    </div>
  );
}
