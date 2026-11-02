// Contenido pendiente de revisión (decisión D1): solo existe en desarrollo (/dev/revision).
// Sus textos van sueltos a propósito: no es interfaz para el estudiante.
import { Link } from "@tanstack/react-router";
import { LevelBadge } from "@/components/shared/level-badge";
import { Badge } from "@/components/ui/badge";
import { getAllExerciseSets, getAllLessons, getUnits, type ExerciseSetEntry } from "@/content";
import { getSection } from "@/content/sections";
import { canPractice } from "@/features/exercises/list-practice";
import { pendingReview, type SetRole } from "./revision";

const roleLabel: Record<SetRole, string> = {
  guided: "guiada",
  free: "libre",
  worksheet: "worksheet",
  review: "repaso",
};

const link = "font-medium text-primary hover:underline";

function SetRow({ set, role }: { set: ExerciseSetEntry; role?: SetRole }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <Link to="/ejercicios/$id" params={{ id: set.id }} className={link}>
        {set.meta.titleEs}
      </Link>
      <span className="text-sm text-muted-foreground">{set.itemCount} ítems</span>
      {role && <Badge variant="outline">{roleLabel[role]}</Badge>}
      {set.meta.source === "worksheet" && role !== "worksheet" && (
        <Badge variant="outline">worksheet</Badge>
      )}
      <LevelBadge level={set.meta.level} />
    </li>
  );
}

export function RevisionPage() {
  // El contenido no cambia mientras la página está abierta: se calcula en cada render sin coste apreciable
  const pending = pendingReview(getUnits(), getAllExerciseSets(), getAllLessons());

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Pendiente de revisión</h1>
        <p className="text-muted-foreground">
          {pending.total} sets y listas con <code>reviewed: false</code>. Se marcan como revisados
          cuando los haya revisado un profesional (decisión D1, docs/PLAN.md §14).
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Unidades del curso</h2>
        {pending.units.map(({ unit, sets }) => (
          <div key={unit.slug} className="space-y-2">
            <h3 className="font-semibold">
              <Link to="/curso/$unidad" params={{ unidad: unit.slug }} className="hover:underline">
                {unit.meta.number}. {unit.meta.titleEs}
              </Link>
            </h3>
            <ul className="space-y-1">
              {sets.map(({ set, role }) => (
                <SetRow key={set.id} set={set} role={role} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      {pending.loose.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Sets fuera de las unidades</h2>
          <ul className="space-y-1">
            {pending.loose.map((set) => (
              <SetRow key={set.id} set={set} />
            ))}
          </ul>
        </section>
      )}

      {pending.sections.map(({ section, lists }) => (
        <section key={section} className="space-y-2">
          <h2 className="text-xl font-semibold">
            Listas: {getSection(section)?.titleEs ?? section}
          </h2>
          <ul className="space-y-1">
            {lists.map((lesson) => (
              <li key={lesson.path} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  to="/biblioteca/$section/$"
                  params={{ section: lesson.section, _splat: lesson.slug }}
                  className={link}
                >
                  {lesson.meta.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {lesson.translatedCount} palabras traducidas
                </span>
                <Link to="/practicar/flashcards" search={{ lista: lesson.path }} className={link}>
                  Flashcards
                </Link>
                {canPractice(lesson) && (
                  <Link
                    to="/practicar/vocabulario"
                    search={{ lista: lesson.path }}
                    className={link}
                  >
                    Practicar
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
