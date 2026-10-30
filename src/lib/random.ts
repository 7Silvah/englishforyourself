// Barajado reproducible: la misma semilla da siempre el mismo orden.
// Así las fichas no cambian de sitio al volver a renderizar y los tests son estables.

/** Convierte un texto en un número de 32 bits (FNV-1a) */
export function hashString(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Generador pseudoaleatorio mulberry32: devuelve números entre 0 y 1 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Copia barajada (Fisher-Yates) de una lista, con semilla */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const random = mulberry32(hashString(seed));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = result[i];
    const b = result[j];
    if (a === undefined || b === undefined) continue;
    result[i] = b;
    result[j] = a;
  }
  return result;
}
