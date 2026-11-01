import { describe, expect, it } from "vitest";
import type { ExerciseSetEntry, LessonEntry, UnitEntry } from "@/content";
import { pendingReview } from "./revision";

function set(id: string, reviewed?: boolean): ExerciseSetEntry {
  return {
    id,
    meta: { title: id, titleEs: id, instructionEs: "—", source: "original", level: "A1", reviewed },
    itemCount: 6,
    load: async () => ({
      title: id,
      titleEs: id,
      instructionEs: "—",
      source: "original",
      level: "A1",
      items: [],
    }),
  };
}

function unit(
  slug: string,
  sets: Pick<UnitEntry["meta"], "guided" | "free" | "worksheets" | "review">,
): UnitEntry {
  return {
    slug,
    meta: {
      number: 1,
      title: slug,
      titleEs: slug,
      summaryEs: "—",
      level: "A1",
      objectivesEs: ["a", "b"],
      ...sets,
    },
    load: async () => () => null,
  };
}

function list(path: string, translatedCount: number, reviewed?: boolean): LessonEntry {
  const [section = "", slug = ""] = path.split("/");
  return {
    section,
    slug,
    path,
    meta: { kind: "wordlist", title: slug, reviewed },
    wordCount: 10,
    translatedCount,
    load: async () => ({ kind: "wordlist", list: { kind: "wordlist", title: slug, groups: [] } }),
  };
}

describe("pendingReview", () => {
  const units = [
    unit("verbo-to-be", { guided: ["g"], free: ["f"], worksheets: ["w"], review: "r" }),
    unit("revisada", { guided: ["ok"] }),
  ];
  const sets = [set("g"), set("f"), set("w"), set("r", true), set("ok", true), set("b1")];

  it("agrupa por unidad, en orden y con su papel, sin los sets revisados", () => {
    const { units: pending } = pendingReview(units, sets, []);
    expect(pending).toHaveLength(1);
    expect(pending[0]?.sets.map((s) => [s.set.id, s.role])).toEqual([
      ["g", "guided"],
      ["f", "free"],
      ["w", "worksheet"],
    ]);
  });

  it("separa los sets que no están en ninguna unidad", () => {
    expect(pendingReview(units, sets, []).loose.map((s) => s.id)).toEqual(["b1"]);
  });

  it("solo cuenta las listas con traducciones sin revisar, agrupadas por sección", () => {
    const lessons = [
      list("vocabulary/animals", 200),
      list("vocabulary/sin-traducir", 0),
      list("vocabulary/revisada", 50, true),
      list("phrasal-verbs/along", 9),
    ];
    const result = pendingReview(units, sets, lessons);
    expect(result.sections.map((s) => [s.section, s.lists.map((l) => l.slug)])).toEqual([
      ["vocabulary", ["animals"]],
      ["phrasal-verbs", ["along"]],
    ]);
    expect(result.total).toBe(4 + 2);
  });
});
