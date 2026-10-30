// Esquemas de los ejercicios (docs/PLAN.md §7). Se validan al compilar (content:check);
// la app solo importa los tipos. Cada tipo de ejercicio tiene un
// "type" distinto; z.discriminatedUnion usa ese campo para saber qué esquema aplicar.
import { z } from "zod";
import { Level } from "@/content/schema";

const answers = z.array(z.string().min(1)).min(1);

const Base = z.object({
  id: z.string().min(1),
  explanationEs: z.string().optional(), // se muestra al corregir
  hintEs: z.string().optional(), // botón "Pista"
  audio: z.boolean().optional(), // muestra 🔊 con la frase correcta
});

// "I ___ (to travel) to South Korea last year." — un ___ por cada hueco
const FillBlank = Base.extend({
  type: z.literal("fill-blank"),
  text: z.string().min(1),
  blanks: z.array(z.object({ answers })).min(1),
});

const MultipleChoice = Base.extend({
  type: z.literal("multiple-choice"),
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().nonnegative(), // índice en options
});

const TrueFalse = Base.extend({
  type: z.literal("true-false"),
  statement: z.string().min(1),
  answer: z.boolean(),
});

const WordOrder = Base.extend({
  type: z.literal("word-order"),
  answers, // frases completas válidas; las fichas salen de la primera
  distractors: z.array(z.string()).optional(),
});

const Transform = Base.extend({
  type: z.literal("transform"),
  source: z.string().min(1),
  to: z.enum(["pos", "neg", "q", "nq", "past", "future", "passive"]),
  answers,
});

const ErrorCorrection = Base.extend({
  type: z.literal("error-correction"),
  sentence: z.string().min(1),
  wrong: z.string().min(1), // fragmento incorrecto dentro de sentence
  answers, // correcciones válidas del fragmento
});

const Match = Base.extend({
  type: z.literal("match"),
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(2),
});

const Categorize = Base.extend({
  type: z.literal("categorize"),
  categories: z
    .array(
      z.object({ label: z.string(), labelEs: z.string().optional(), items: z.array(z.string()) }),
    )
    .min(2),
});

const Translate = Base.extend({
  type: z.literal("translate"),
  es: z.string().min(1), // frase en español
  answers,
  wordBank: z.array(z.string()).optional(), // si existe, se responde tocando fichas
});

const Dictation = Base.extend({
  type: z.literal("dictation"),
  text: z.string().min(1),
  answers: z.array(z.string()).optional(), // variantes aceptadas además de text
});

const TableFill = Base.extend({
  type: z.literal("table-fill"),
  caption: z.string().optional(),
  columns: z.array(z.string()).min(1),
  rows: z
    .array(
      z.object({
        header: z.string(),
        cells: z.array(z.union([z.string(), z.object({ answers })])),
      }),
    )
    .min(1),
});

const ListenChoose = Base.extend({
  type: z.literal("listen-choose"),
  audioText: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().nonnegative(),
});

export const ExerciseItem = z.discriminatedUnion("type", [
  FillBlank,
  MultipleChoice,
  TrueFalse,
  WordOrder,
  Transform,
  ErrorCorrection,
  Match,
  Categorize,
  Translate,
  Dictation,
  TableFill,
  ListenChoose,
]);
export type ExerciseItem = z.infer<typeof ExerciseItem>;
export type ExerciseType = ExerciseItem["type"];

// Metadatos del set (sin "items", que es la parte pesada)
export const ExerciseSetMeta = z.strictObject({
  title: z.string().min(1),
  titleEs: z.string().min(1),
  instruction: z.string().optional(), // instrucción original en inglés
  instructionEs: z.string().min(1),
  source: z.enum(["worksheet", "original", "generated"]),
  level: Level,
  unit: z.string().optional(),
  lessons: z.array(z.string()).optional(), // "seccion/slug"
  topics: z.array(z.string()).optional(),
  reviewed: z.boolean().optional(), // revisado por una persona (decisión D1)
  legacyPath: z.string().optional(), // PDF original, para las redirecciones
});
export type ExerciseSetMeta = z.infer<typeof ExerciseSetMeta>;

export const ExerciseSet = z.strictObject({
  ...ExerciseSetMeta.shape,
  items: z.array(ExerciseItem).min(1),
});
export type ExerciseSet = z.infer<typeof ExerciseSet>;
