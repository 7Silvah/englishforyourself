// Datos que no están en los PDF: id nuevo, títulos e instrucción en español, nivel,
// temas y lecciones relacionadas. Mapeado a mano a partir del nombre del archivo.
import type { Level } from "@/content/schema";

type WorksheetInfo = {
  id: string;
  title: string;
  titleEs: string;
  instructionEs: string;
  level: Level;
  topics: string[];
  lessons: string[];
};

const VERB_FORM = "Escribe el verbo entre paréntesis en la forma correcta.";
const VERB_FORM_NEG = "Escribe el verbo entre paréntesis en forma negativa.";

// Para los tiempos verbales: afirmativa y negativa comparten lección y temas
function tense(
  id: string,
  title: string,
  titleEs: string,
  level: Level,
  lesson: string,
  topic: string,
): [WorksheetInfo, WorksheetInfo] {
  return [
    {
      id,
      title,
      titleEs,
      instructionEs: VERB_FORM,
      level,
      topics: [topic, "positive"],
      lessons: [lesson],
    },
    {
      id: `${id}-negative`,
      title: `${title} – Negative Form`,
      titleEs: `${titleEs}: forma negativa`,
      instructionEs: VERB_FORM_NEG,
      level,
      topics: [topic, "negative"],
      lessons: [lesson],
    },
  ];
}

const [presentSimple, presentSimpleNeg] = tense(
  "present-simple",
  "Present Simple",
  "Presente simple",
  "A1",
  "verb-tenses/simple-present-tense-structure-examples",
  "present-simple",
);
const [presentContinuous, presentContinuousNeg] = tense(
  "present-continuous",
  "Present Continuous",
  "Presente continuo",
  "A2",
  "verb-tenses/present-continuous-tense",
  "present-continuous",
);
const [simplePast, simplePastNeg] = tense(
  "simple-past",
  "Simple Past",
  "Pasado simple",
  "A2",
  "verb-tenses/simple-past-tense",
  "past-simple",
);
const [pastContinuous, pastContinuousNeg] = tense(
  "past-continuous",
  "Past Continuous",
  "Pasado continuo",
  "A2",
  "verb-tenses/past-continuous-tense",
  "past-continuous",
);
const [presentPerfect, presentPerfectNeg] = tense(
  "present-perfect",
  "Present Perfect",
  "Presente perfecto",
  "B1",
  "verb-tenses/present-perfect-tense",
  "present-perfect",
);
const [presentPerfectCont, presentPerfectContNeg] = tense(
  "present-perfect-continuous",
  "Present Perfect Continuous",
  "Presente perfecto continuo",
  "B1",
  "verb-tenses/present-perfect-continuous",
  "present-perfect-continuous",
);
const [pastPerfect, pastPerfectNeg] = tense(
  "past-perfect",
  "Past Perfect",
  "Pasado perfecto",
  "B1",
  "verb-tenses/past-perfect-tense",
  "past-perfect",
);
const [pastPerfectCont, pastPerfectContNeg] = tense(
  "past-perfect-continuous",
  "Past Perfect Continuous",
  "Pasado perfecto continuo",
  "B2",
  "verb-tenses/past-perfect-continuous",
  "past-perfect-continuous",
);
const [futureSimple, futureSimpleNeg] = tense(
  "future-simple",
  "Future Simple (will)",
  "Futuro simple (will)",
  "A2",
  "verb-tenses/future-simple-will",
  "future-simple",
);
const [futureContinuous, futureContinuousNeg] = tense(
  "future-continuous",
  "Future Continuous",
  "Futuro continuo",
  "B1",
  "verb-tenses/future-continuous-tense",
  "future-continuous",
);
const [futurePerfect, futurePerfectNeg] = tense(
  "future-perfect",
  "Future Perfect",
  "Futuro perfecto",
  "B2",
  "verb-tenses/future-perfect-tense",
  "future-perfect",
);
const [futurePerfectCont, futurePerfectContNeg] = tense(
  "future-perfect-continuous",
  "Future Perfect Continuous",
  "Futuro perfecto continuo",
  "B2",
  "verb-tenses/future-perfect-continuous-tense",
  "future-perfect-continuous",
);

const conditional = (id: string, title: string, titleEs: string, level: Level): WorksheetInfo => ({
  id,
  title,
  titleEs,
  instructionEs: "Escribe los verbos entre paréntesis en la forma correcta.",
  level,
  topics: ["conditionals", id],
  lessons: ["grammar/conditionals"],
});

// Clave: nombre del PDF original
export const worksheetMap: Record<string, WorksheetInfo> = {
  "Verb-To-Be-Exercises-Worksheet.pdf": {
    id: "verb-to-be",
    title: "Verb To Be",
    titleEs: "El verbo to be",
    instructionEs: "Completa con am, is o are.",
    level: "A1",
    topics: ["verb-to-be"],
    lessons: [],
  },
  "Articles-A-An-The-Exercises-Worksheet.pdf": {
    id: "articles",
    title: "Articles: A, An, The",
    titleEs: "Artículos: a, an, the",
    instructionEs: "Escribe el artículo correcto: a, an o the.",
    level: "A1",
    topics: ["articles"],
    lessons: ["grammar/articles"],
  },
  "Present-Simple-Tense-Exercises-Worksheet-1.pdf": presentSimple,
  "Present-Simple-Tense-Negative-Form-Exercises-Worksheet.pdf": presentSimpleNeg,
  "Present-Continous-or-Progressive-Exercises-Worksheet.pdf": presentContinuous,
  "Present-Continous-or-Progressive-Negative-Form-Exercises-Worksheet.pdf": presentContinuousNeg,
  "Simple-Past-Tense-Exercises-Worksheet.pdf": simplePast,
  "Simple-Past-Tense-Negative-Form-Exercises-Worksheet.pdf": simplePastNeg,
  "Past-Continous-or-Progressive-Exercises-Worksheet.pdf": pastContinuous,
  "Past-Continous-or-Progressive-Negative-Form-Exercises-Worksheet.pdf": pastContinuousNeg,
  "Present-Perfect-Tense-Exercises-Worksheet.pdf": presentPerfect,
  "Present-Perfect-Tense-Negative-Form-Exercises.pdf": presentPerfectNeg,
  "Present-Perfect-Continous-or-Progressive-Exercises-Worksheet.pdf": presentPerfectCont,
  "Present-Perfect-Continous-or-Progressive-Negative-Form-Exercises-Worksheet.pdf":
    presentPerfectContNeg,
  "Past-Perfect-Exercises-Worksheet.pdf": pastPerfect,
  "Past-Perfect-Negative-Form-Exercises-Worksheet.pdf": pastPerfectNeg,
  "Past-Perfect-Continous-or-Progressive-Exercises-Worksheet.pdf": pastPerfectCont,
  "Past-Perfect-Continous-or-Progressive-Negative-Form-Exercises-Worksheet.pdf": pastPerfectContNeg,
  "Future-Simple-Exercises-Worksheet.pdf": futureSimple,
  "Future-Simple-Negative-Form-Exercises-Worksheet.pdf": futureSimpleNeg,
  "Future-Simple-Going-to-Exercises-Worksheet.pdf": {
    id: "future-going-to",
    title: "Future Simple (going to)",
    titleEs: "Futuro con going to",
    instructionEs: VERB_FORM,
    level: "A2",
    topics: ["future-going-to", "positive"],
    lessons: ["verb-tenses/future-simple-going-to"],
  },
  "Future-Continous-or-Progressive-Exercises-Worksheet.pdf": futureContinuous,
  "Future-Continous-or-Progressive-Negative-Form-Exercises-Worksheet.pdf": futureContinuousNeg,
  "Future-Perfect-Exercises-Worksheet.pdf": futurePerfect,
  "Future-Perfect-Negative-Form-Exercises-Worksheet.pdf": futurePerfectNeg,
  "Future-Perfect-Continous-or-Progressive-Exercises-Worksheet.pdf": futurePerfectCont,
  "Future-Perfect-Continous-or-Progressive-Negative-Form-Exercises-Worksheet.pdf":
    futurePerfectContNeg,
  "Comparative-and-Superlative-Exercises-Worksheet.pdf": {
    id: "comparative-and-superlative",
    title: "Comparative and Superlative",
    titleEs: "Comparativos y superlativos",
    instructionEs: "Completa con la forma comparativa o superlativa del adjetivo.",
    level: "A2",
    topics: ["comparatives", "superlatives", "adjectives"],
    lessons: ["grammar/adjectives/types-of-adjectives/comparative-and-superlative-adjectives"],
  },
  "Zero-Conditional-Exercises-Worksheet.pdf": conditional(
    "zero-conditional",
    "Zero Conditional",
    "Condicional cero",
    "B1",
  ),
  "First-Conditional-Exercises-Worksheet.pdf": conditional(
    "first-conditional",
    "First Conditional",
    "Primer condicional",
    "B1",
  ),
  "Second-Conditional-Exercises-Worksheet.pdf": conditional(
    "second-conditional",
    "Second Conditional",
    "Segundo condicional",
    "B1",
  ),
  "Third-Conditional-Exercises-Worksheet.pdf": conditional(
    "third-conditional",
    "Third Conditional",
    "Tercer condicional",
    "B2",
  ),
  "Passive-Voice-Exercises-Worksheet.pdf": {
    id: "passive-voice",
    title: "Passive Voice",
    titleEs: "Voz pasiva",
    instructionEs: "Escribe el verbo en voz pasiva, en el tiempo indicado.",
    level: "B1",
    topics: ["passive-voice"],
    lessons: ["grammar/active-and-passive-voice"],
  },
  "Gerund-and-Infinitive-Exercises-Worksheet.pdf": {
    id: "gerund-and-infinitive",
    title: "Gerund and Infinitive",
    titleEs: "Gerundio e infinitivo",
    instructionEs: "Escribe el gerundio (verbo + -ing) o el infinitivo (to + verbo) correcto.",
    level: "B1",
    topics: ["gerund", "infinitive"],
    lessons: ["grammar/verbs/verb-forms"],
  },
  "Tag-Questions-Exercises-Worksheet.pdf": {
    id: "tag-questions",
    title: "Tag Questions",
    titleEs: "Tag questions (preguntas de confirmación)",
    instructionEs: "Escribe la tag question correcta al final de la frase.",
    level: "B1",
    topics: ["tag-questions", "questions"],
    lessons: [],
  },
};
