// Genera public/_redirects (formato de Netlify y Cloudflare Pages) con las URLs del sitio antiguo.
// Lee "legacyPath" de las lecciones y los sets de ejercicios ya migrados.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readFrontmatter } from "../vite-plugin-content-meta";

const ROOT = "src/content";

async function files(dir: string, ext: string) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(ext))
    .map((e) => path.join(e.parentPath, e.name).split(path.sep).join("/"));
}

const rules: [string, string][] = [
  ["/index.html", "/"],
  ["/about.html", "/acerca"],
  ["/lessons/worksheets/index.html", "/ejercicios"],
];

for (const section of [
  "verb-tenses",
  "grammar",
  "vocabulary",
  "ways-to-say",
  "phrasal-verbs",
  "collocations",
  "idioms",
])
  rules.push([`/lessons/${section}/index.html`, `/biblioteca/${section}`]);

for (const folder of ["lessons", "wordlists"]) {
  for (const file of await files(`${ROOT}/${folder}`, folder === "lessons" ? ".mdx" : ".json")) {
    const source = await readFile(file, "utf8");
    const meta = file.endsWith(".mdx")
      ? readFrontmatter(source)
      : (JSON.parse(source) as Record<string, unknown>);
    const lessonPath = file.slice(`${ROOT}/${folder}/`.length).replace(/\.(mdx|json)$/, "");
    if (typeof meta.legacyPath === "string")
      rules.push([`/${meta.legacyPath}`, `/biblioteca/${lessonPath}`]);
  }
}

for (const file of await files(`${ROOT}/exercises`, ".json")) {
  const set = JSON.parse(await readFile(file, "utf8")) as { legacyPath?: string };
  if (set.legacyPath)
    rules.push([`/${set.legacyPath}`, `/ejercicios/${path.basename(file, ".json")}`]);
}

rules.sort(([a], [b]) => a.localeCompare(b));
const body = [
  "# Generado por scripts/migrate/redirects.ts — URLs del sitio antiguo → app nueva",
  ...rules.map(([from, to]) => `${from} ${to} 301`),
  "",
  "# SPA: cualquier otra ruta la resuelve el router de la app",
  "/* /index.html 200",
  "",
].join("\n");
await writeFile("public/_redirects", body);
console.log(`public/_redirects: ${rules.length} redirecciones`);
