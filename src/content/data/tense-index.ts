// Índice de los tiempos verbales del Tense Lab: solo nombres, nivel y lección.
// Va aparte de tenses.ts para que las rutas puedan validar un ?tense= o poner una miga
// sin cargar las tablas completas (que solo necesita el Tense Lab).
import type { Level } from "@/content/schema";

export const TENSES = [
  {
    id: "simple-present",
    name: "Simple Present",
    nameEs: "Presente simple",
    level: "A1",
    lesson: "verb-tenses/simple-present-tense-structure-examples",
  },
  {
    id: "present-continuous",
    name: "Present Continuous",
    nameEs: "Presente continuo",
    level: "A2",
    lesson: "verb-tenses/present-continuous-tense",
  },
  {
    id: "present-perfect",
    name: "Present Perfect",
    nameEs: "Presente perfecto",
    level: "B1",
    lesson: "verb-tenses/present-perfect-tense",
  },
  {
    id: "present-perfect-continuous",
    name: "Present Perfect Continuous",
    nameEs: "Presente perfecto continuo",
    level: "B1",
    lesson: "verb-tenses/present-perfect-continuous",
  },
  {
    id: "simple-past",
    name: "Simple Past",
    nameEs: "Pasado simple",
    level: "A2",
    lesson: "verb-tenses/simple-past-tense",
  },
  {
    id: "past-continuous",
    name: "Past Continuous",
    nameEs: "Pasado continuo",
    level: "B1",
    lesson: "verb-tenses/past-continuous-tense",
  },
  {
    id: "past-perfect",
    name: "Past Perfect",
    nameEs: "Pasado perfecto",
    level: "B1",
    lesson: "verb-tenses/past-perfect-tense",
  },
  {
    id: "past-perfect-continuous",
    name: "Past Perfect Continuous",
    nameEs: "Pasado perfecto continuo",
    level: "B2",
    lesson: "verb-tenses/past-perfect-continuous",
  },
  {
    id: "future-simple-will",
    name: "Future Simple (will)",
    nameEs: "Futuro simple (will)",
    level: "A2",
    lesson: "verb-tenses/future-simple-will",
  },
  {
    id: "future-simple-going-to",
    name: "Future Simple (going to)",
    nameEs: "Futuro con going to",
    level: "A2",
    lesson: "verb-tenses/future-simple-going-to",
  },
  {
    id: "future-continuous",
    name: "Future Continuous",
    nameEs: "Futuro continuo",
    level: "B1",
    lesson: "verb-tenses/future-continuous-tense",
  },
  {
    id: "future-perfect",
    name: "Future Perfect",
    nameEs: "Futuro perfecto",
    level: "B2",
    lesson: "verb-tenses/future-perfect-tense",
  },
  {
    id: "future-perfect-continuous",
    name: "Future Perfect Continuous",
    nameEs: "Futuro perfecto continuo",
    level: "B2",
    lesson: "verb-tenses/future-perfect-continuous-tense",
  },
] as const satisfies readonly {
  id: string;
  name: string;
  nameEs: string;
  level: Level;
  lesson: string; // lección de la Biblioteca ("seccion/slug")
}[];

export type TenseId = (typeof TENSES)[number]["id"];
export type TenseInfo = (typeof TENSES)[number];

export function getTenseInfo(id: string): TenseInfo | undefined {
  return TENSES.find((t) => t.id === id);
}

/** Tiempo verbal que explica una lección de la Biblioteca, si lo hay */
export function getTenseByLesson(path: string): TenseInfo | undefined {
  return TENSES.find((t) => t.lesson === path);
}
