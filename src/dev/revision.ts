// Qué contenido falta por revisar (decisión D1): los sets y las listas traducidas sin
// `reviewed: true`. Mismo criterio que `npm run content:check`.
import type { ExerciseSetEntry, LessonEntry, UnitEntry } from "@/content";
import { unitSequence } from "@/features/course/logic";

export type SetRole = "guided" | "free" | "worksheet" | "review";

export type PendingSet = { set: ExerciseSetEntry; role?: SetRole };
export type PendingUnit = { unit: UnitEntry; sets: PendingSet[] };
export type PendingSection = { section: string; lists: LessonEntry[] };

export type PendingReview = {
  units: PendingUnit[];
  /** Sets que no forman parte de ninguna unidad (los worksheets B1–B2, por ahora) */
  loose: ExerciseSetEntry[];
  sections: PendingSection[];
  total: number;
};

function roleIn(unit: UnitEntry, id: string): SetRole | undefined {
  const { guided, free, worksheets, review } = unit.meta;
  if (guided?.includes(id)) return "guided";
  if (free?.includes(id)) return "free";
  if (worksheets?.includes(id)) return "worksheet";
  if (review === id) return "review";
  return undefined;
}

export function pendingReview(
  units: readonly UnitEntry[],
  sets: readonly ExerciseSetEntry[],
  lessons: readonly LessonEntry[],
): PendingReview {
  const byId = new Map(sets.filter((s) => !s.meta.reviewed).map((s) => [s.id, s]));
  const inUnit = new Set<string>();

  const pendingUnits = units.flatMap((unit) => {
    const unitSets = unitSequence(unit.meta).flatMap((id) => {
      const set = byId.get(id);
      if (!set) return [];
      inUnit.add(id);
      return [{ set, role: roleIn(unit, id) }];
    });
    return unitSets.length ? [{ unit, sets: unitSets }] : [];
  });

  const loose = [...byId.values()].filter((s) => !inUnit.has(s.id));

  const sections = new Map<string, LessonEntry[]>();
  for (const lesson of lessons) {
    if (lesson.meta.kind !== "wordlist" || lesson.meta.reviewed || lesson.translatedCount === 0)
      continue;
    sections.set(lesson.section, [...(sections.get(lesson.section) ?? []), lesson]);
  }
  const pendingSections = [...sections].map(([section, lists]) => ({ section, lists }));

  const listCount = pendingSections.reduce((n, s) => n + s.lists.length, 0);
  return {
    units: pendingUnits,
    loose,
    sections: pendingSections,
    total: byId.size + listCount,
  };
}
