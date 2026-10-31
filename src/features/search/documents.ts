// Documentos del buscador: unidades, lecciones, sets, tiempos verbales y palabras.
// Este módulo (y con él todas las palabras) solo se descarga al abrir el buscador.
import { getAllExerciseSets, getAllLessons, getUnits } from "@/content";
import { TENSES } from "@/content/data/tense-index";
import { getSection } from "@/content/sections";
import { getAllWords } from "@/content/words";
import { es } from "@/i18n/es";
import { createSearchIndex, type SearchDoc } from "./engine";

function lessonTarget(path: string) {
  const [section = "", ...rest] = path.split("/");
  return { kind: "lesson" as const, section, slug: rest.join("/") };
}

export function buildDocuments(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const unit of getUnits())
    docs.push({
      id: `u:${unit.slug}`,
      type: "unit",
      title: `${es.course.unitN(unit.meta.number)} · ${unit.meta.titleEs}`,
      subtitle: unit.meta.title,
      text: unit.meta.summaryEs,
      target: { kind: "unit", slug: unit.slug },
    });

  for (const lesson of getAllLessons())
    docs.push({
      id: `l:${lesson.path}`,
      type: "lesson",
      title: lesson.meta.titleEs ?? lesson.meta.title,
      subtitle: getSection(lesson.section)?.titleEs,
      text: [lesson.meta.title, lesson.meta.summaryEs].filter(Boolean).join(" "),
      target: lessonTarget(lesson.path),
    });

  for (const tense of TENSES)
    docs.push({
      id: `t:${tense.id}`,
      type: "tense",
      title: tense.nameEs,
      subtitle: tense.name,
      target: { kind: "tense", id: tense.id },
    });

  for (const set of getAllExerciseSets())
    docs.push({
      id: `s:${set.id}`,
      type: "set",
      title: set.meta.titleEs,
      subtitle: set.meta.level,
      text: set.meta.title,
      target: { kind: "set", id: set.id },
    });

  getAllWords().forEach((word, i) =>
    docs.push({
      id: `w:${i}`,
      type: "word",
      title: word.en,
      subtitle: word.es,
      target: lessonTarget(word.lessonPath),
    }),
  );

  return docs;
}

// El índice se construye una sola vez, la primera vez que se usa
let index: ReturnType<typeof createSearchIndex> | undefined;

export function getSearchIndex() {
  index ??= createSearchIndex(buildDocuments());
  return index;
}
