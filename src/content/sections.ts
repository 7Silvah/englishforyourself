// Secciones de la Biblioteca. Los slugs son los del sitio original (no cambiarlos:
// las redirecciones de las URLs viejas dependen de ellos).
// La sección "worksheets" del sitio original no está aquí: sus PDF pasan a /ejercicios.
export const sections = [
  {
    slug: "verb-tenses",
    title: "Verb Tenses",
    titleEs: "Tiempos verbales",
    descriptionEs: "Todos los tiempos verbales del inglés, con su estructura y ejemplos.",
  },
  {
    slug: "grammar",
    title: "Grammar",
    titleEs: "Gramática",
    descriptionEs: "Sustantivos, adjetivos, artículos, condicionales, voz pasiva y más.",
  },
  {
    slug: "vocabulary",
    title: "Vocabulary",
    titleEs: "Vocabulario",
    descriptionEs: "Palabras por temas: la casa, la comida, el trabajo, los animales y más.",
  },
  {
    slug: "ways-to-say",
    title: "Ways to Say",
    titleEs: "Formas de decir",
    descriptionEs: "Expresiones para saludar, agradecer, disculparte, opinar y más.",
  },
  {
    slug: "phrasal-verbs",
    title: "Phrasal Verbs",
    titleEs: "Phrasal verbs",
    descriptionEs: "Verbos con partícula (get up, look after…) por listas y por partícula.",
  },
  {
    slug: "collocations",
    title: "Collocations",
    titleEs: "Collocations",
    descriptionEs: "Combinaciones naturales de palabras: make a decision, take a break…",
  },
  {
    slug: "idioms",
    title: "Idioms",
    titleEs: "Idioms (modismos)",
    descriptionEs: "Expresiones idiomáticas comunes y por temas.",
  },
] as const;

export type Section = (typeof sections)[number];
export type SectionSlug = Section["slug"];

export function getSection(slug: string): Section | undefined {
  return sections.find((s) => s.slug === slug);
}
