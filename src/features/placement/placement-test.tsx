import { Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getUnit, getUnits } from "@/content";
import type { PlacementItem } from "@/features/exercises/schema";
import { ExercisePlayer } from "@/features/exercises/player/exercise-player";
import type { ItemRecord } from "@/features/exercises/player/logic";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { levelScores, recommendedFromTest, unitResults, type Outcome } from "./logic";

const t = es.placement;

type Stage = { kind: "intro" } | { kind: "test" } | { kind: "result"; outcomes: Outcome[] };

// Tres pantallas: explicación, la prueba (el player en modo examen: sin corrección hasta el
// final) y el resultado. La recomendación se guarda al terminar, en el mismo evento.
// Repetir pasa por el resultado, que desmonta el player: siempre empieza de cero.
export function PlacementTest({ items }: { items: readonly PlacementItem[] }) {
  const [stage, setStage] = useState<Stage>({ kind: "intro" });
  const setPlacement = useProgressStore((state) => state.setPlacement);
  const order = getUnits().map((u) => u.slug);

  const start = () => setStage({ kind: "test" });

  function finish(records: ItemRecord[]) {
    const unitOf = new Map(items.map((item) => [item.id, item.unit]));
    const outcomes = records.flatMap((r) => {
      const unit = unitOf.get(r.item.id);
      return unit ? [{ unit, correct: r.result.status === "correct" }] : [];
    });
    const recommended = recommendedFromTest(outcomes, order);
    if (recommended) setPlacement(recommended);
    setStage({ kind: "result", outcomes });
  }

  if (stage.kind === "intro")
    return (
      <div className="max-w-2xl space-y-4">
        <ul className="list-disc space-y-1 pl-5">
          {t.intro.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <Button size="lg" onClick={start}>
          {t.start}
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    );

  if (stage.kind === "test")
    return <ExercisePlayer setId="prueba-de-nivel" items={items} mode="exam" onFinish={finish} />;

  const recommended = getUnit(recommendedFromTest(stage.outcomes, order) ?? "");
  const results = unitResults(stage.outcomes, order);
  const allGood = results.find((r) => r.unit === recommended?.slug)?.ok ?? false;
  const scores = levelScores(stage.outcomes, (slug) => getUnit(slug)?.meta.level);

  return (
    <div className="max-w-2xl space-y-6" aria-live="polite">
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-xl font-semibold">{t.resultTitle}</h2>
        {recommended && (
          <>
            <p className="text-2xl font-bold">
              {t.level(recommended.meta.level, es.course.levels[recommended.meta.level].name)}
            </p>
            <p className="text-muted-foreground">{es.course.levels[recommended.meta.level].goal}</p>
            <p className="text-lg">
              {allGood
                ? t.allGood
                : t.recommendation(recommended.meta.number, recommended.meta.titleEs)}
            </p>
            <p className="text-sm text-muted-foreground">{t.seenNote}</p>
            <Link
              to="/curso/$unidad"
              params={{ unidad: recommended.slug }}
              className={buttonVariants({ size: "lg" })}
            >
              {t.go}: {es.course.unitN(recommended.meta.number)} · {recommended.meta.titleEs}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
          </>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t.byLevel}</h2>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scores.map(({ level, correct, total }) => (
            <div key={level} className="rounded-lg border bg-card p-3 text-center">
              <dt className="text-sm text-muted-foreground">{level}</dt>
              <dd className="text-lg font-semibold">{t.score(correct, total)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={start}>
          <RotateCcw data-icon="inline-start" aria-hidden />
          {t.retry}
        </Button>
        <Link to="/curso" className={buttonVariants({ variant: "ghost" })}>
          {t.course}
        </Link>
      </div>
    </div>
  );
}
