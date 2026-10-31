// Revisión de paridad (F11): antes de borrar legacy/, comprueba que cada página y cada
// PDF del sitio antiguo tienen redirección a algo que existe en la app, y que el texto
// de cada lección migrada no se ha quedado corto. Se ejecuta una vez: npx tsx scripts/parity-check.ts
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const LEGACY = "legacy";
const CONTENT = "src/content";

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.join(e.parentPath, e.name).split(path.sep).join("/"));
}

// Reglas de public/_redirects: "/origen /destino 301"
const rules = new Map<string, string>();
for (const line of (await readFile("public/_redirects", "utf8")).split("\n")) {
  const [from, to] = line.trim().split(/\s+/);
  if (from && to && !from.startsWith("#") && from !== "/*") rules.set(from, to);
}

const sections = new Set(
  (await readdir(`${CONTENT}/lessons`)).concat(await readdir(`${CONTENT}/wordlists`)),
);
const exists = (target: string): boolean => {
  const [pathname = ""] = target.split("#");
  if (["/", "/acerca", "/ejercicios", "/biblioteca", "/curso"].includes(pathname)) return true;
  const lesson = pathname.match(/^\/biblioteca\/([^/]+)(?:\/(.+))?$/);
  if (lesson) {
    if (!lesson[2]) return sections.has(lesson[1] ?? "");
    const rel = `${lesson[1]}/${lesson[2]}`;
    return (
      existsSync(`${CONTENT}/lessons/${rel}.mdx`) || existsSync(`${CONTENT}/wordlists/${rel}.json`)
    );
  }
  const set = pathname.match(/^\/ejercicios\/(.+)$/);
  if (set) return existsSync(`${CONTENT}/exercises/worksheets/${set[1]}.json`);
  return false;
};

// Texto visible de una página antigua (sin cabecera, menú ni pie)
function legacyText(html: string): string {
  const $ = cheerio.load(html);
  $("header, nav, footer, script, style").remove();
  return $("main").length ? $("main").text() : $("body").text();
}

// Texto aproximado de una lección migrada (sin frontmatter, imports ni etiquetas)
async function migratedText(target: string): Promise<string> {
  const rel = target.replace(/^\/biblioteca\//, "");
  const mdx = `${CONTENT}/lessons/${rel}.mdx`;
  if (existsSync(mdx)) {
    let text = (await readFile(mdx, "utf8")).replace(/^---[\s\S]*?---/, "");
    // Las tablas viven en JSON aparte: se suma su texto
    for (const m of text.matchAll(/from "@\/content\/(tables\/.+\.json)"/g))
      if (m[1]) text += JSON.stringify(JSON.parse(await readFile(`${CONTENT}/${m[1]}`, "utf8")));
    return text.replace(/^import .*$/gm, "").replace(/<[^>]+>/g, " ");
  }
  const json = `${CONTENT}/wordlists/${rel}.json`;
  return existsSync(json) ? await readFile(json, "utf8") : "";
}

const words = (text: string) => (text.match(/[A-Za-z']+/g) ?? []).length;

const problems: string[] = [];
const short: string[] = [];
const legal: string[] = [];
let pages = 0;
let pdfs = 0;

for (const file of await walk(LEGACY)) {
  const url = `/${file.slice(LEGACY.length + 1)}`;
  if (file.endsWith(".pdf")) {
    pdfs++;
    const to = rules.get(url);
    if (!to || !exists(to)) problems.push(`PDF sin destino: ${url} → ${to ?? "(sin regla)"}`);
    continue;
  }
  if (!file.endsWith(".html")) continue;
  pages++;
  const candidates = [url, url.replace(/index\.html$/, ""), url.replace(/\/index\.html$/, "")];
  const to = candidates.map((c) => rules.get(c)).find(Boolean);
  if (url.startsWith("/legal/")) {
    legal.push(`${url} → ${to ?? "(sin regla)"}`);
    continue;
  }
  if (!to) {
    problems.push(`sin redirección: ${url}`);
    continue;
  }
  if (!exists(to)) {
    problems.push(`destino inexistente: ${url} → ${to}`);
    continue;
  }
  if (!to.startsWith("/biblioteca/") || to.split("/").length < 4) continue;
  const before = words(legacyText(await readFile(file, "utf8")));
  const after = words(await migratedText(to));
  if (before > 50 && after < before * 0.8)
    short.push(
      `${url} → ${to}: ${after} palabras de ${before} (${Math.round((100 * after) / before)} %)`,
    );
}

console.log(`Páginas HTML: ${pages} · PDF: ${pdfs} · reglas en _redirects: ${rules.size}`);
console.log(`\nPáginas legales (no migradas a propósito, decisión de F4):`);
for (const l of legal) console.log(`  - ${l}`);
console.log(`\nLecciones con menos del 80 % del texto original: ${short.length}`);
for (const s of short) console.log(`  - ${s}`);
console.log(`\nProblemas: ${problems.length}`);
for (const p of problems) console.log(`  - ${p}`);
