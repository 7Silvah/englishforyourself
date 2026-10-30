// Manifiesto del contenido: qué lecciones y ejercicios existen y cómo cargarlos.
//
// Cada archivo se importa de dos formas:
//   - "?meta" (eager): solo los metadatos, para listas, breadcrumbs y búsqueda.
//   - normal (lazy): el cuerpo completo, que se descarga al abrir la lección.
// Ver scripts/vite-plugin-content-meta.ts para saber por qué hacen falta las dos.
import type { ComponentType } from "react";
import type { ExerciseSet, ExerciseSetMeta } from "@/features/exercises/schema";
import type { ArticleMeta, LessonMeta, WordList, WordListMeta } from "./schema";

type MdxModule = { default: ComponentType<{ components?: Record<string, unknown> }> };

// El contenido se valida con Zod al compilar (npm run content:check, incluido en
// npm run build). Aquí se confía en él sin volver a validarlo: así Zod no entra en
// el paquete del navegador. Es el único sitio de la app donde se hace este "as".
function trusted<T>(data: unknown): T {
  return data as T;
}

type WithCount = { itemCount?: number };

// Las claves son rutas relativas: "./lessons/grammar/articles.mdx"
const articleMeta = import.meta.glob<unknown>("./lessons/**/*.mdx", {
  query: "?meta",
  import: "default",
  eager: true,
});
const articleBody = import.meta.glob<MdxModule>("./lessons/**/*.mdx");
const wordlistMeta = import.meta.glob<unknown>("./wordlists/**/*.json", {
  query: "?meta",
  import: "default",
  eager: true,
});
const wordlistBody = import.meta.glob<unknown>("./wordlists/**/*.json", { import: "default" });
const exerciseMeta = import.meta.glob<unknown>("./exercises/**/*.json", {
  query: "?meta",
  import: "default",
  eager: true,
});
const exerciseBody = import.meta.glob<unknown>("./exercises/**/*.json", { import: "default" });

// ---------- Lecciones de la Biblioteca ----------

export type LoadedLesson =
  { kind: "article"; Content: MdxModule["default"] } | { kind: "wordlist"; list: WordList };

export type LessonEntry = {
  section: string;
  slug: string; // puede tener "/": "adjectives/types-of-adjectives"
  path: string; // "grammar/adjectives/types-of-adjectives"
  parent?: string; // path de la lección padre, si existe
  meta: LessonMeta;
  wordCount: number; // palabras de una lista (0 en artículos)
  load: () => Promise<LoadedLesson>;
};

// "./lessons/grammar/adjectives.mdx" → { section: "grammar", slug: "adjectives", path: "grammar/adjectives" }
function locate(file: string, folder: string) {
  const path = file.slice(`./${folder}/`.length).replace(/\.(mdx|json)$/, "");
  const [section = "", ...rest] = path.split("/");
  return { section, slug: rest.join("/"), path };
}

const lessons: LessonEntry[] = [];

for (const [file, raw] of Object.entries(articleMeta)) {
  const loader = articleBody[file];
  if (!loader) continue;
  lessons.push({
    ...locate(file, "lessons"),
    meta: trusted<ArticleMeta>(raw),
    wordCount: 0,
    load: async () => ({ kind: "article", Content: (await loader()).default }),
  });
}

for (const [file, raw] of Object.entries(wordlistMeta)) {
  const loader = wordlistBody[file];
  if (!loader) continue;
  lessons.push({
    ...locate(file, "wordlists"),
    meta: trusted<WordListMeta>(raw),
    wordCount: trusted<WithCount>(raw).itemCount ?? 0,
    load: async () => ({ kind: "wordlist", list: trusted<WordList>(await loader()) }),
  });
}

// Lección padre: la ruta más larga que sea prefijo ("grammar/adjectives" de "grammar/adjectives/x")
const byPath = new Map(lessons.map((l) => [l.path, l]));
for (const lesson of lessons) {
  const parts = lesson.path.split("/");
  for (let n = parts.length - 1; n >= 2; n--) {
    const candidate = parts.slice(0, n).join("/");
    if (byPath.has(candidate)) {
      lesson.parent = candidate;
      break;
    }
  }
}

lessons.sort(
  (a, b) =>
    (a.meta.order ?? 999) - (b.meta.order ?? 999) || a.meta.title.localeCompare(b.meta.title),
);

export function getLesson(section: string, slug: string): LessonEntry | undefined {
  return byPath.get(`${section}/${slug}`);
}

export function getLessonByPath(path: string): LessonEntry | undefined {
  return byPath.get(path);
}

/** Lecciones de primer nivel de una sección, en orden */
export function getSectionLessons(section: string): LessonEntry[] {
  return lessons.filter((l) => l.section === section && !l.parent);
}

export function getChildLessons(path: string): LessonEntry[] {
  return lessons.filter((l) => l.parent === path);
}

export function getAllLessons(): LessonEntry[] {
  return lessons;
}

/** Lección anterior y siguiente entre sus hermanas (mismo padre o misma sección) */
export function getPrevNext(lesson: LessonEntry) {
  const siblings = lesson.parent
    ? getChildLessons(lesson.parent)
    : getSectionLessons(lesson.section);
  const i = siblings.indexOf(lesson);
  return { prev: siblings[i - 1], next: siblings[i + 1] };
}

// ---------- Sets de ejercicios ----------

export type ExerciseSetEntry = {
  id: string; // nombre del archivo: "simple-past"
  meta: ExerciseSetMeta;
  itemCount: number;
  load: () => Promise<ExerciseSet>;
};

const exerciseSets: ExerciseSetEntry[] = Object.entries(exerciseMeta).flatMap(([file, raw]) => {
  const loader = exerciseBody[file];
  if (!loader) return [];
  const id =
    file
      .split("/")
      .pop()
      ?.replace(/\.json$/, "") ?? file;
  return [
    {
      id,
      meta: trusted<ExerciseSetMeta>(raw),
      itemCount: trusted<WithCount>(raw).itemCount ?? 0,
      load: async () => trusted<ExerciseSet>(await loader()),
    },
  ];
});
const setsById = new Map(exerciseSets.map((s) => [s.id, s]));

export function getExerciseSet(id: string): ExerciseSetEntry | undefined {
  return setsById.get(id);
}

export function getAllExerciseSets(): ExerciseSetEntry[] {
  return exerciseSets;
}

/** Sets de ejercicios relacionados con una lección ("seccion/slug") */
export function getExerciseSetsForLesson(path: string): ExerciseSetEntry[] {
  return exerciseSets.filter((s) => s.meta.lessons?.includes(path));
}
