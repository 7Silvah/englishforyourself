import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getExerciseSet, getUnits } from "@/content";
import type { UnitBlock } from "@/content/schema";
import { unitStatus } from "@/features/course/logic";
import { FlashcardSummary } from "@/features/flashcards/flashcard-summary";
import { es } from "@/i18n/es";
import { useProgressStore } from "./store";

const t = es.progress;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export function ProgressOverview() {
  const { attempts, mistakes, streak, reset } = useProgressStore();

  // Los más recientes primero; se ignoran sets que ya no existen
  const done = Object.entries(attempts)
    .flatMap(([id, attempt]) => {
      const set = getExerciseSet(id);
      return set ? [{ id, set, attempt }] : [];
    })
    .sort((a, b) => b.attempt.at.localeCompare(a.attempt.at));

  if (done.length === 0)
    return (
      <div className="space-y-4">
        <FlashcardSummary />
        <p className="text-muted-foreground">{t.empty}</p>
        <Link to="/ejercicios" className={buttonVariants()}>
          {t.goToExercises}
        </Link>
      </div>
    );

  const unitsByBlock = new Map<UnitBlock, ReturnType<typeof getUnits>>();
  for (const unit of getUnits())
    unitsByBlock.set(unit.meta.block, [...(unitsByBlock.get(unit.meta.block) ?? []), unit]);

  const average = Math.round(done.reduce((sum, d) => sum + d.attempt.best, 0) / done.length);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.setsDone} value={String(done.length)} />
        <Stat label={t.average} value={`${average} %`} />
        <Stat label={t.streak} value={t.days(streak?.days ?? 0)} />
        <Stat label={t.mistakes} value={String(Object.keys(mistakes).length)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <section aria-labelledby="progress-units" className="space-y-2 rounded-lg border p-4">
          <h2 id="progress-units" className="font-semibold">
            {t.units}
          </h2>
          <ul className="space-y-1 text-sm">
            {[...unitsByBlock].map(([block, units]) => (
              <li key={block} className="flex justify-between gap-2">
                <span>{es.course.blocks[block]}</span>
                <span className="text-muted-foreground tabular-nums">
                  {t.unitsMastered(
                    units.filter((u) => unitStatus(u.meta, attempts) === "mastered").length,
                    units.length,
                  )}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/curso" className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t.goToCourse}
          </Link>
        </section>
        <section aria-labelledby="progress-review" className="space-y-2 rounded-lg border p-4">
          <h2 id="progress-review" className="font-semibold">
            {es.review.mistakes.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {Object.keys(mistakes).length > 0
              ? es.review.mistakes.pending(Object.keys(mistakes).length)
              : es.review.mistakes.empty}
          </p>
          <Link to="/repaso" className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t.goToReview}
          </Link>
        </section>
      </div>

      <FlashcardSummary />

      <ul className="divide-y rounded-lg border">
        {done.map(({ id, set, attempt }) => (
          <li key={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
            <Link to="/ejercicios/$id" params={{ id }} className="font-medium hover:underline">
              {set.meta.titleEs}
            </Link>
            <Badge variant="secondary">{set.meta.level}</Badge>
            <span className="ml-auto flex gap-3 text-sm text-muted-foreground tabular-nums">
              <span>{es.exercises.best(attempt.best)}</span>
              <span>{t.last(attempt.last)}</span>
              <span>{t.attempts(attempt.count)}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{t.stored}</p>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => {
            if (window.confirm(t.resetConfirm)) reset();
          }}
        >
          {t.reset}
        </Button>
      </div>
    </div>
  );
}
