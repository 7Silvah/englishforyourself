import type { Tone } from "@/content/schema";

// Color sólido: encabezados de tabla y palabras marcadas con [[tono:texto]]
export const toneSolid: Record<Tone, string> = {
  pos: "bg-pos text-pos-ink",
  neg: "bg-neg text-neg-ink",
  q: "bg-q text-q-ink",
  nq: "bg-nq text-nq-ink",
  purple: "bg-violet-200 text-violet-950 dark:bg-violet-500/30 dark:text-violet-100",
  teal: "bg-teal-200 text-teal-950 dark:bg-teal-500/30 dark:text-teal-100",
  blue: "bg-sky-200 text-sky-950 dark:bg-sky-500/30 dark:text-sky-100",
};

// Fondo suave: celdas y líneas del cuerpo de una tabla
export const toneSoft: Record<Tone, string> = {
  pos: "bg-pos-soft",
  neg: "bg-neg-soft",
  q: "bg-q-soft",
  nq: "bg-nq-soft",
  purple: "bg-violet-50 dark:bg-violet-500/15",
  teal: "bg-teal-50 dark:bg-teal-500/15",
  blue: "bg-sky-50 dark:bg-sky-500/15",
};
