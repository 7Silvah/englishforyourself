// Valida todo src/content. Se ejecuta con `npm run content:check` y antes de cada build.
// La app no valida el contenido en el navegador (ver src/content/index.ts): lo hace este script.
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import type { z } from "zod";
import { ArticleMeta, RawTable, UnitMeta, WordList } from "@/content/schema";
import { sections } from "@/content/sections";
import { ExerciseSet } from "@/features/exercises/schema";
import { readFrontmatter } from "./vite-plugin-content-meta";

const ROOT = "src/content";
const errors: string[] = [];
const info: string[] = [];

async function files(dir: string, ext: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(ext))
    .map((e) => path.join(e.parentPath, e.name).split(path.sep).join("/"))
    .sort();
}

function validate<T extends z.ZodType>(
  schema: T,
  data: unknown,
  file: string,
): z.infer<T> | undefined {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  for (const issue of result.error.issues)
    errors.push(`${file}: ${issue.path.join(".") || "(raíz)"} → ${issue.message}`);
  return undefined;
}

const rel = (file: string, folder: string) =>
  file.slice(`${ROOT}/${folder}/`.length).replace(/\.(mdx|json)$/, "");

// ---------- Lecciones ----------

const sectionSlugs = new Set<string>(sections.map((s) => s.slug));
const lessonPaths = new Set<string>();
const lessonRefs: { file: string; field: string; target: string }[] = [];
const mdxLinks: { file: string; href: string }[] = [];
const coverage = new Map<string, { words: number; translated: number }>();

for (const file of await files(`${ROOT}/lessons`, ".mdx")) {
  const lessonPath = rel(file, "lessons");
  lessonPaths.add(lessonPath);
  const source = await readFile(file, "utf8");
  const meta = validate(ArticleMeta, readFrontmatter(source), file);
  try {
    await compile(source, { remarkPlugins: [remarkFrontmatter, remarkGfm] });
  } catch (e) {
    errors.push(`${file}: el MDX no compila → ${(e as Error).message}`);
  }
  for (const m of source.matchAll(/^import \w+ from "@\/content\/(.+)";$/gm))
    if (m[1] && !existsSync(`${ROOT}/${m[1]}`))
      errors.push(`${file}: importa un archivo que no existe → ${m[1]}`);
  for (const m of source.matchAll(/\]\((\/[^)\s]*)\)/g))
    if (m[1]) mdxLinks.push({ file, href: m[1] });
  for (const r of meta?.related ?? []) lessonRefs.push({ file, field: "related", target: r });
}

for (const file of await files(`${ROOT}/wordlists`, ".json")) {
  const lessonPath = rel(file, "wordlists");
  if (lessonPaths.has(lessonPath))
    errors.push(`${file}: ya existe una lección MDX con la misma ruta`);
  lessonPaths.add(lessonPath);
  const list = validate(WordList, JSON.parse(await readFile(file, "utf8")), file);
  const section = lessonPath.split("/")[0] ?? "";
  const c = coverage.get(section) ?? { words: 0, translated: 0 };
  for (const g of list?.groups ?? [])
    for (const w of g.items) {
      c.words++;
      if (w.es) c.translated++;
    }
  coverage.set(section, c);
  for (const r of list?.related ?? []) lessonRefs.push({ file, field: "related", target: r });
}

for (const p of lessonPaths) {
  const section = p.split("/")[0] ?? "";
  if (!sectionSlugs.has(section))
    errors.push(`lección ${p}: la sección "${section}" no está en sections.ts`);
}

for (const file of await files(`${ROOT}/tables`, ".json"))
  validate(RawTable, JSON.parse(await readFile(file, "utf8")), file);

// ---------- Ejercicios ----------

const setIds = new Map<string, string>();
const setUnits = new Map<string, string | undefined>(); // id del set → campo "unit"
let unreviewed = 0;
let itemTotal = 0;

for (const file of await files(`${ROOT}/exercises`, ".json")) {
  const id = path.basename(file, ".json");
  if (setIds.has(id)) errors.push(`${file}: id "${id}" repetido (también en ${setIds.get(id)})`);
  setIds.set(id, file);
  const set = validate(ExerciseSet, JSON.parse(await readFile(file, "utf8")), file);
  if (!set) continue;
  setUnits.set(id, set.unit);
  if (!set.reviewed) unreviewed++;
  for (const l of set.lessons ?? []) lessonRefs.push({ file, field: "lessons", target: l });

  const itemIds = new Set<string>();
  for (const item of set.items) {
    itemTotal++;
    const where = `${file} ítem ${item.id}`;
    if (itemIds.has(item.id)) errors.push(`${where}: id de ítem repetido`);
    itemIds.add(item.id);
    if (set.source === "original" && !item.explanationEs)
      errors.push(`${where}: falta explanationEs (obligatoria en los sets original)`);
    switch (item.type) {
      case "fill-blank": {
        const holes = item.text.split("___").length - 1;
        if (holes !== item.blanks.length)
          errors.push(
            `${where}: la frase tiene ${holes} huecos (___) y hay ${item.blanks.length} respuestas`,
          );
        break;
      }
      case "multiple-choice":
      case "listen-choose":
        if (item.answer >= item.options.length) errors.push(`${where}: answer fuera de options`);
        break;
      case "error-correction":
        if (!item.sentence.includes(item.wrong))
          errors.push(`${where}: "${item.wrong}" no está en la frase`);
        else if (item.sentence.indexOf(item.wrong) !== item.sentence.lastIndexOf(item.wrong))
          errors.push(`${where}: "${item.wrong}" aparece más de una vez en la frase`);
        break;
      case "word-order": {
        // Las fichas salen de la primera respuesta: las demás deben usar las mismas
        const tiles = (s: string) => s.split(/\s+/).filter(Boolean).sort().join(" ");
        const first = tiles(item.answers[0] ?? "");
        for (const answer of item.answers.slice(1))
          if (tiles(answer) !== first)
            errors.push(`${where}: "${answer}" no usa las mismas fichas que la primera respuesta`);
        break;
      }
    }
  }
}

// ---------- Unidades del curso ----------

const unitSlugs = new Set<string>();
const unitNumbers = new Set<number>();
const setOwner = new Map<string, string>(); // un set solo puede estar en una unidad

for (const file of await files(`${ROOT}/course/units`, ".mdx")) {
  const name = path.basename(file, ".mdx");
  const match = name.match(/^(\d{2})-([a-z0-9-]+)$/);
  if (!match) {
    errors.push(`${file}: el nombre debe ser NN-slug.mdx (p. ej. 03-verbo-to-be.mdx)`);
    continue;
  }
  const [, num = "", slug = ""] = match;
  unitSlugs.add(slug);
  const source = await readFile(file, "utf8");
  const meta = validate(UnitMeta, readFrontmatter(source), file);
  try {
    await compile(source, { remarkPlugins: [remarkFrontmatter, remarkGfm] });
  } catch (e) {
    errors.push(`${file}: el MDX no compila → ${(e as Error).message}`);
  }
  for (const m of source.matchAll(/\]\((\/[^)\s]*)\)/g))
    if (m[1]) mdxLinks.push({ file, href: m[1] });
  if (!meta) continue;

  if (meta.number !== Number(num))
    errors.push(`${file}: number ${meta.number} no coincide con ${num}`);
  if (unitNumbers.has(meta.number)) errors.push(`${file}: número de unidad repetido`);
  unitNumbers.add(meta.number);
  for (const l of meta.library ?? []) lessonRefs.push({ file, field: "library", target: l });

  // Los sets propios (práctica y repaso) deben declarar esta unidad; los worksheets no
  const own = [...(meta.guided ?? []), ...(meta.free ?? []), ...(meta.review ? [meta.review] : [])];
  for (const id of [...own, ...(meta.worksheets ?? [])]) {
    if (!setIds.has(id)) errors.push(`${file}: el set "${id}" no existe`);
    const owner = setOwner.get(id);
    if (owner) errors.push(`${file}: el set "${id}" ya está en la unidad ${owner}`);
    setOwner.set(id, slug);
  }
  for (const id of own)
    if (setIds.has(id) && setUnits.get(id) !== slug)
      errors.push(`${file}: el set "${id}" debe tener "unit": "${slug}"`);
}

for (const [id, unit] of setUnits)
  if (unit && setOwner.get(id) !== unit)
    errors.push(`set ${id}: dice "unit": "${unit}", pero esa unidad no lo incluye`);

// ---------- Referencias y enlaces ----------

for (const { file, field, target } of lessonRefs)
  if (!lessonPaths.has(target))
    errors.push(`${file}: ${field} apunta a una lección que no existe → ${target}`);

for (const { file, href } of mdxLinks) {
  const [pathname = ""] = href.split("#");
  const lib = pathname.match(/^\/biblioteca\/([^/]+)(?:\/(.+))?$/);
  const ex = pathname.match(/^\/ejercicios\/(.+)$/);
  const unit = pathname.match(/^\/curso\/(.+)$/);
  const ok = lib
    ? lib[2]
      ? lessonPaths.has(`${lib[1]}/${lib[2]}`)
      : sectionSlugs.has(lib[1] ?? "")
    : ex
      ? setIds.has(ex[1] ?? "")
      : unit
        ? unitSlugs.has(unit[1] ?? "")
        : ["/", "/curso", "/ejercicios", "/biblioteca", "/progreso", "/acerca"].includes(pathname);
  if (!ok) errors.push(`${file}: enlace roto → ${href}`);
}

// ---------- Informe ----------

info.push(
  `${lessonPaths.size} lecciones, ${unitSlugs.size} unidades, ${setIds.size} sets de ejercicios (${itemTotal} ítems)`,
);
info.push(`Sets sin revisar por una persona (reviewed: false): ${unreviewed} — ver decisión D1`);
for (const [section, c] of [...coverage].sort())
  info.push(
    `Traducción de ${section}: ${c.translated}/${c.words} palabras (${Math.round((100 * c.translated) / Math.max(c.words, 1))} %)`,
  );

console.log(info.map((l) => `  ${l}`).join("\n"));
if (errors.length) {
  console.error(`\n✗ ${errors.length} errores:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exitCode = 1;
} else {
  console.log("\n✓ Contenido válido");
}
