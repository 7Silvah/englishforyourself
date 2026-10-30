import type { Level } from "./schema";

// Archivo aparte a propósito: lo importa el validateSearch de /ejercicios, que va en el
// paquete principal. Si estuviera en el catálogo, todo el catálogo entraría con él.
export const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const satisfies readonly Level[];
