import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, FlaskConical, PencilLine } from "lucide-react";
import type { ReactNode } from "react";
import {
  getChildLessons,
  getExerciseSetsForLesson,
  getPrevNext,
  type LessonEntry,
} from "@/content";
import { buttonVariants } from "@/components/ui/button";
import { getTenseByLesson } from "@/content/data/tense-index";
import { es } from "@/i18n/es";

function LessonLink({ lesson, children }: { lesson: LessonEntry; children: ReactNode }) {
  return (
    <Link
      to="/biblioteca/$section/$"
      params={{ section: lesson.section, _splat: lesson.slug }}
      className="font-medium text-primary hover:underline"
    >
      {children}
    </Link>
  );
}

// Lecciones hijas: se muestran al principio de la lección padre
export function ChildLessons({ lesson }: { lesson: LessonEntry }) {
  const children = getChildLessons(lesson.path);
  if (children.length === 0) return null;
  return (
    <nav aria-label={es.library.inThisTopic} className="rounded-lg border bg-muted/30 p-4">
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{es.library.inThisTopic}</h2>
      <ul className="space-y-1">
        {children.map((child) => (
          <li key={child.path} lang="en">
            <LessonLink lesson={child}>{child.meta.title}</LessonLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Final de la lección: ejercicios relacionados y lección anterior/siguiente
export function LessonFooter({ lesson }: { lesson: LessonEntry }) {
  const { prev, next } = getPrevNext(lesson);
  const sets = getExerciseSetsForLesson(lesson.path);
  // Si la lección explica un tiempo verbal: enlaces al Tense Lab y a la práctica generada
  const tense = getTenseByLesson(lesson.path);

  return (
    <div className="mt-12 space-y-6 border-t pt-6">
      {sets.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <PencilLine className="size-4 text-primary" aria-hidden />
            {es.library.practice}
          </h2>
          <ul className="space-y-1">
            {sets.map((set) => (
              <li key={set.id} className="flex flex-wrap items-baseline gap-x-2">
                <Link
                  to="/ejercicios/$id"
                  params={{ id: set.id }}
                  className="font-medium text-primary hover:underline"
                >
                  {set.meta.titleEs}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {es.exercises.itemsCount(set.itemCount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tense && (
        <section className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
          <h2 className="mr-auto flex items-center gap-2 font-semibold">
            <FlaskConical className="size-4 text-primary" aria-hidden />
            {es.library.practiceTense}
          </h2>
          <Link
            to="/herramientas/tense-lab"
            search={{ tense: tense.id }}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {es.generated.openLab}
          </Link>
          <Link
            to="/ejercicios/practicar/$tema"
            params={{ tema: tense.id }}
            className={buttonVariants({ size: "sm" })}
          >
            {es.tenseLab.practice}
          </Link>
        </section>
      )}

      <nav
        className="grid gap-3 sm:grid-cols-2"
        aria-label={`${es.library.previous} / ${es.library.next}`}
      >
        {prev ? (
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronLeft className="size-3" aria-hidden />
              {es.library.previous}
            </p>
            <p lang="en">
              <LessonLink lesson={prev}>{prev.meta.title}</LessonLink>
            </p>
          </div>
        ) : (
          <span />
        )}
        {next && (
          <div className="rounded-lg border p-3 text-right">
            <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              {es.library.next}
              <ChevronRight className="size-3" aria-hidden />
            </p>
            <p lang="en">
              <LessonLink lesson={next}>{next.meta.title}</LessonLink>
            </p>
          </div>
        )}
      </nav>
    </div>
  );
}
