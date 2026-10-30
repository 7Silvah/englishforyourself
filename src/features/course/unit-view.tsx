import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ClipboardCheck, Target } from "lucide-react";
import type { ComponentType } from "react";
import { mdxComponents } from "@/components/lesson/mdx-components";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  getExerciseSet,
  getLessonByPath,
  getPrevNextUnit,
  type ExerciseSetEntry,
  type UnitEntry,
} from "@/content";
import type { Attempt } from "@/features/progress/logic";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { MASTERY, unitStatus } from "./logic";
import { UnitStatusBadge } from "./unit-status-badge";

const t = es.course;

type Content = ComponentType<{ components?: Record<string, unknown> }>;

function sets(ids: readonly string[] | undefined): ExerciseSetEntry[] {
  return (ids ?? []).flatMap((id) => {
    const set = getExerciseSet(id);
    return set ? [set] : [];
  });
}

function SetGroup({
  title,
  hint,
  ids,
  attempts,
}: {
  title: string;
  hint: string;
  ids?: readonly string[];
  attempts: Record<string, Attempt>;
}) {
  const list = sets(ids);
  if (list.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((set) => {
          const best = attempts[set.id]?.best;
          return (
            <li key={set.id}>
              <Link
                to="/ejercicios/$id"
                params={{ id: set.id }}
                className="group flex h-full flex-col gap-1 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <span className="font-medium group-hover:underline">{set.meta.titleEs}</span>
                <span className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {es.exercises.itemsCount(set.itemCount)}
                  {best !== undefined && <Badge variant="outline">{es.exercises.best(best)}</Badge>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Página de una unidad, en el orden de la plantilla (docs/PLAN.md §6.2):
// objetivos → explicación, comparación y errores (MDX) → práctica → worksheet → repaso → biblioteca
export function UnitView({ unit, Content }: { unit: UnitEntry; Content: Content }) {
  const attempts = useProgressStore((state) => state.attempts);
  const { meta } = unit;
  const review = meta.review ? getExerciseSet(meta.review) : undefined;
  const reviewBest = review ? attempts[review.id]?.best : undefined;
  const { prev, next } = getPrevNextUnit(unit);
  const library = (meta.library ?? []).flatMap((path) => {
    const lesson = getLessonByPath(path);
    return lesson ? [lesson] : [];
  });

  return (
    <article className="mx-auto max-w-3xl">
      <PageHeader title={meta.titleEs} description={meta.summaryEs}>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Badge variant="secondary">{t.unitN(meta.number)}</Badge>
          <Badge variant="secondary">{meta.level}</Badge>
          <UnitStatusBadge status={unitStatus(meta, attempts)} />
          <span lang="en" className="text-sm text-muted-foreground">
            {meta.title}
          </span>
        </div>
      </PageHeader>

      <section aria-labelledby="objectives" className="rounded-lg border bg-muted/30 p-4">
        <h2 id="objectives" className="flex items-center gap-2 font-semibold">
          <Target className="size-5 text-primary" aria-hidden />
          {t.objectives}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          {meta.objectivesEs.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>

      <Content components={mdxComponents} />

      <section aria-labelledby="practice" className="mt-12 space-y-8 border-t pt-8">
        <h2 id="practice" className="font-heading text-2xl font-bold tracking-tight">
          {t.practiceTitle}
        </h2>
        <SetGroup title={t.guided} hint={t.guidedHint} ids={meta.guided} attempts={attempts} />
        <SetGroup title={t.free} hint={t.freeHint} ids={meta.free} attempts={attempts} />
        <SetGroup
          title={t.worksheets}
          hint={t.worksheetsHint}
          ids={meta.worksheets}
          attempts={attempts}
        />
        {review && (
          <div className="space-y-3 rounded-lg border-2 border-primary/40 p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-5 text-primary" aria-hidden />
              {t.review}
            </h3>
            <p className="text-sm text-muted-foreground">{t.reviewHint(MASTERY)}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/ejercicios/$id"
                params={{ id: review.id }}
                search={{ modo: "examen" }}
                className={buttonVariants()}
              >
                {t.startReview}
              </Link>
              <span className="text-sm text-muted-foreground">
                {es.exercises.itemsCount(review.itemCount)}
              </span>
              {reviewBest !== undefined && (
                <Badge variant="outline">{es.exercises.best(reviewBest)}</Badge>
              )}
            </div>
          </div>
        )}
      </section>

      {library.length > 0 && (
        <section aria-labelledby="library" className="mt-10 space-y-2">
          <h2 id="library" className="font-heading text-xl font-semibold">
            {t.library}
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            {library.map((lesson) => (
              <li key={lesson.path}>
                <Link
                  to="/biblioteca/$section/$"
                  params={{ section: lesson.section, _splat: lesson.slug }}
                  className="font-medium text-primary hover:underline"
                >
                  {lesson.meta.titleEs ?? lesson.meta.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav
        aria-label={t.title}
        className="mt-12 flex flex-wrap justify-between gap-4 border-t pt-6"
      >
        {prev ? (
          <Link
            to="/curso/$unidad"
            params={{ unidad: prev.slug }}
            className={cn(buttonVariants({ variant: "ghost" }), "h-auto py-2")}
          >
            <ChevronLeft data-icon="inline-start" aria-hidden />
            <span className="text-left">
              <span className="block text-xs text-muted-foreground">{t.previous}</span>
              {prev.meta.titleEs}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to="/curso/$unidad"
            params={{ unidad: next.slug }}
            className={cn(buttonVariants({ variant: "ghost" }), "h-auto py-2")}
          >
            <span className="text-right">
              <span className="block text-xs text-muted-foreground">{t.next}</span>
              {next.meta.titleEs}
            </span>
            <ChevronRight data-icon="inline-end" aria-hidden />
          </Link>
        )}
      </nav>
    </article>
  );
}
