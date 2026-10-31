import { createContext } from "react";

// true dentro de <Examples>: así los <li> del MDX saben que son frases de ejemplo
// y añaden su botón 🔊 sin tener que cambiar el MDX de las lecciones.
export const ExamplesContext = createContext(false);
