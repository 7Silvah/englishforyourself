import { Link } from "@tanstack/react-router";
import { ArrowRight, History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getExerciseSet, getUnits } from "@/content";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { recommendedUnit } from "./logic";

// Botones de la portada: "Empieza aquí" (o tu siguiente unidad) y "Continúa donde lo dejaste"
export function ContinueLearning() {
  const attempts = useProgressStore((state) => state.attempts);
  const lastSetId = useProgressStore((state) => state.lastSetId);
  const units = getUnits();
  const unit = recommendedUnit(units, attempts);
  const lastSet = lastSetId ? getExerciseSet(lastSetId) : undefined;
  const hasProgress = Object.keys(attempts).length > 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-3">
        {unit ? (
          <Link
            to="/curso/$unidad"
            params={{ unidad: unit.slug }}
            className={buttonVariants({ size: "lg" })}
          >
            {hasProgress ? es.home.nextUnit : es.home.startHere}:{" "}
            {es.course.unitN(unit.meta.number)} · {unit.meta.titleEs}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Link>
        ) : (
          <Link to="/curso" className={buttonVariants({ size: "lg" })}>
            {es.home.startCourse}
          </Link>
        )}
        <Link to="/biblioteca" className={buttonVariants({ size: "lg", variant: "outline" })}>
          {es.home.browseLibrary}
        </Link>
      </div>
      {lastSet && (
        <Link
          to="/ejercicios/$id"
          params={{ id: lastSet.id }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          <History className="size-4" aria-hidden />
          {es.home.continue}: <strong className="text-foreground">{lastSet.meta.titleEs}</strong>
        </Link>
      )}
    </div>
  );
}
