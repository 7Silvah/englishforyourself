// Plugin de Vite: `import meta from "./leccion.mdx?meta"` devuelve SOLO los metadatos
// (frontmatter de un .mdx, o un .json sin sus claves pesadas "groups"/"items").
//
// ¿Por qué? La Biblioteca y el catálogo necesitan los metadatos de todo desde el
// inicio, pero el cuerpo de cada lección debe descargarse solo al abrirla. Si se
// importara el mismo archivo de las dos formas, Vite lo metería entero en el
// paquete principal. Con ?meta son módulos distintos y el cuerpo queda aparte.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import { parse as parseYaml } from "yaml";

const QUERY = "?meta";
// Id virtual: "\0efy-meta:<ruta>.meta.js". El \0 indica a otros plugins que no es un archivo
// real, y el final .meta.js evita que el plugin de JSON lo tome por un .json.
const PREFIX = "\0efy-meta:";
const SUFFIX = ".meta.js";
const HEAVY_KEYS = new Set(["groups", "items"]);

export function readFrontmatter(source: string): Record<string, unknown> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] ? (parseYaml(match[1]) as Record<string, unknown>) : {};
}

// Metadatos de un .json: todo menos las claves pesadas, más cuántos elementos tienen.
export function jsonMeta(data: Record<string, unknown>): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  let itemCount = 0;
  for (const [key, value] of Object.entries(data)) {
    if (!HEAVY_KEYS.has(key)) meta[key] = value;
    else if (key === "items" && Array.isArray(value)) itemCount = value.length;
    else if (key === "groups" && Array.isArray(value))
      itemCount = value.reduce(
        (n: number, g: { items?: unknown[] }) => n + (g.items?.length ?? 0),
        0,
      );
  }
  return { ...meta, itemCount };
}

export function contentMeta(): Plugin {
  return {
    name: "efy:content-meta",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.endsWith(QUERY) || !importer) return null;
      const file = path.resolve(path.dirname(importer), source.slice(0, -QUERY.length));
      return PREFIX + file + SUFFIX;
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const file = id.slice(PREFIX.length, -SUFFIX.length);
      this.addWatchFile(file); // si cambia el archivo, se recarga su módulo ?meta
      const source = await readFile(file, "utf8");
      const meta = file.endsWith(".json")
        ? jsonMeta(JSON.parse(source) as Record<string, unknown>)
        : readFrontmatter(source);
      return `export default ${JSON.stringify(meta)};`;
    },
  };
}
