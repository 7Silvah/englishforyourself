// Esquemas del contenido.
//
// Se validan AL COMPILAR (npm run content:check, que también ejecuta npm run build), no en
// el navegador: el contenido es nuestro y validarlo en cada visita costaría ~40 KB de Zod.
// La app solo importa los TIPOS de este archivo (import type), que no ocupan nada.
//
// Los campos opcionales no tienen valor por defecto: el código que los usa debe
// contemplar que falten (p. ej. `meta.tags ?? []`).
import { z } from "zod";

export const Level = z.enum(["A1", "A2", "B1", "B2", "C1"]);
export type Level = z.infer<typeof Level>;

// Metadatos comunes a todas las lecciones de la Biblioteca.
// La sección y el slug NO van aquí: salen de la ruta del archivo.
const LessonMetaFields = {
  title: z.string().min(1), // título original en inglés
  titleEs: z.string().optional(),
  summaryEs: z.string().optional(), // 1–2 frases en español para tarjetas y SEO
  level: Level.optional(),
  order: z.number().optional(), // orden dentro de su sección (o de su lección padre)
  tags: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(), // "seccion/slug"
  worksheet: z.string().optional(), // id de un set de ejercicios
  legacyPath: z.string().optional(), // URL del sitio antiguo, para las redirecciones
};

// Lección en prosa: frontmatter de un archivo .mdx
export const ArticleMeta = z.strictObject({
  kind: z.literal("article"),
  ...LessonMetaFields,
});
export type ArticleMeta = z.infer<typeof ArticleMeta>;

// Una palabra o expresión de una lista
export const Word = z.strictObject({
  en: z.string().min(1), // "Hedgehog", "To get along"
  es: z.string().optional(), // "Erizo"
  meanings: z.array(z.string()).optional(), // definiciones en inglés (phrasal verbs, idioms)
  example: z.string().optional(),
  exampleEs: z.string().optional(),
  note: z.string().optional(), // nota en español: "Falso amigo de…"
});
export type Word = z.infer<typeof Word>;

export const WordGroup = z.strictObject({
  title: z.string().optional(), // "Mammals"
  titleEs: z.string().optional(), // "Mamíferos"
  items: z.array(Word).min(1),
});
export type WordGroup = z.infer<typeof WordGroup>;

// Lista de palabras o expresiones: archivo .json
// "groups" es la parte pesada: los metadatos se cargan sin ella (ver content-meta).
export const WordListMeta = z.strictObject({
  kind: z.literal("wordlist"),
  ...LessonMetaFields,
  intro: z.string().optional(), // introducción original en inglés
  introEs: z.string().optional(),
});
export const WordList = z.strictObject({
  ...WordListMeta.shape,
  groups: z.array(WordGroup).min(1),
});
export type WordListMeta = z.infer<typeof WordListMeta>;
export type WordList = z.infer<typeof WordList>;

export type LessonMeta = ArticleMeta | WordListMeta;

// ---------- Unidades del curso ----------

export const UnitBlock = z.enum(["fundamentos-1", "fundamentos-2", "intermedio"]);
export type UnitBlock = z.infer<typeof UnitBlock>;

// Frontmatter de src/content/course/units/NN-slug.mdx (docs/PLAN.md §6.3).
// El slug de la URL sale del nombre del archivo; el número debe coincidir con NN.
// Los campos de sets siguen el orden de la plantilla de §6.2.
export const UnitMeta = z.strictObject({
  number: z.number().int().positive(),
  block: UnitBlock,
  title: z.string().min(1), // en inglés
  titleEs: z.string().min(1),
  summaryEs: z.string().min(1), // una frase para el mapa del curso
  level: Level,
  objectivesEs: z.array(z.string().min(1)).min(2).max(4),
  guided: z.array(z.string()).optional(), // práctica guiada: reconocer
  free: z.array(z.string()).optional(), // práctica libre: producir
  worksheets: z.array(z.string()).optional(), // worksheets migrados de los PDF
  review: z.string().optional(), // repaso final: con ≥ 80 % la unidad queda dominada
  library: z.array(z.string()).optional(), // lecciones "seccion/slug" para profundizar
});
export type UnitMeta = z.infer<typeof UnitMeta>;

// ---------- Tablas ----------

export const Tone = z.enum(["pos", "neg", "q", "nq", "purple", "teal", "blue"]);
export type Tone = z.infer<typeof Tone>;

// Una línea dentro de una celda. El texto admite **negrita**, *cursiva* y [[pos:texto]].
const CellLine = z.union([
  z.string(),
  z.strictObject({ text: z.string(), tone: Tone.optional(), formula: z.boolean().optional() }),
]);

// Una celda puede escribirse como texto simple o como objeto con atributos
// (ver normalizeCell en ./table.ts)
export const RawCell = z.union([
  z.string(),
  z.strictObject({
    text: z.string().optional(),
    lines: z.array(CellLine).optional(),
    header: z.boolean().optional(), // celda de encabezado de fila (<th scope="row">)
    tone: Tone.optional(),
    formula: z.boolean().optional(),
    rowSpan: z.number().int().positive().optional(),
    colSpan: z.number().int().positive().optional(),
  }),
]);
export type RawCell = z.infer<typeof RawCell>;

export const RawTable = z.strictObject({
  caption: z.string().optional(),
  variant: z.enum(["grammar", "plain"]).optional(),
  head: z.array(z.array(RawCell)).optional(),
  body: z.array(z.array(RawCell)).min(1),
});
export type RawTable = z.infer<typeof RawTable>;
