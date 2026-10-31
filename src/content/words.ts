// Palabras de todas las listas de vocabulario, solo { en, es }, para el buscador.
// Usa la consulta "?words" del plugin content-meta: no carga significados ni ejemplos.
// Solo lo importa el buscador, que se descarga al abrirlo; por eso puede ser "eager".
const wordlistWords = import.meta.glob<{ en: string; es?: string }[]>("./wordlists/**/*.json", {
  query: "?words",
  import: "default",
  eager: true,
});

export type WordEntry = { en: string; es?: string; lessonPath: string };

/** Todas las palabras, cada una con la lección ("seccion/slug") donde aparece */
export function getAllWords(): WordEntry[] {
  return Object.entries(wordlistWords).flatMap(([file, words]) => {
    const lessonPath = file.replace(/^\.\/wordlists\//, "").replace(/\.json$/, "");
    return words.map((w) => ({ ...w, lessonPath }));
  });
}
