// Migración: lecciones HTML (legacy/lessons) → src/content/
//   - listas de palabras/expresiones → wordlists/<sección>/<slug>.json
//   - el resto                       → lessons/<sección>/<slug>.mdx (+ tables/…/*.json)
// Uso: npm run migrate:lessons   (idempotente: revisar el resultado con git diff)
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { load, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { ArticleMeta, RawTable, WordList } from "@/content/schema";
import { htmlToMdx } from "./html-to-mdx";
import { tableToContent } from "./html-table";
import { extractWordList } from "./html-wordlist";
import { rewriteHref } from "./legacy-links";

const LEGACY = "legacy";
const OUT = "src/content";
const SKIP_SECTIONS = new Set(["worksheets"]); // sus PDF ya son ejercicios

type Report = { articles: string[]; wordlists: string[]; tables: number; warnings: string[] };
const report: Report = { articles: [], wordlists: [], tables: 0, warnings: [] };

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return nested.flat().filter((f) => f.endsWith(".html"));
}

const toPosix = (p: string) => p.split(path.sep).join("/");

// Orden de las lecciones según la primera aparición de su enlace en el índice de la sección
// o en la navegación de subpáginas de la lección padre.
async function linkOrder(file: string): Promise<string[]> {
  const $ = load(await readFile(path.join(LEGACY, file), "utf8"));
  return $(".lesson-content a, nav.subpages a")
    .toArray()
    .map((a) => $(a).attr("href") ?? "")
    .map((href) => rewriteHref(href, file))
    .filter((u): u is string => !!u?.startsWith("/biblioteca/"))
    .filter((u, i, all) => all.indexOf(u) === i);
}

function cleanContent($: CheerioAPI, legacyFile: string) {
  const $content = $(".lesson-content");
  $content.find("nav.subpages").remove();
  $content.find("figure").each((_, f) => {
    $(f).replaceWith($(f).contents());
  });

  // Navegación entre lecciones: la app ya muestra las lecciones hijas ("En este tema"),
  // anterior/siguiente y el índice de la sección.
  //  1. Bloques que solo son enlaces (listas de subpáginas, "Beyond · Break · Catch…"), en cualquier sitio.
  //  2. Al final: "Read more … here", "Learn vocabulary about:" (que introducía una lista ya quitada).
  //  3. Títulos que se han quedado sin contenido debajo.
  const isLinkOnly = (el: Element) => {
    const $b = $(el);
    const nonLinkText = $b
      .clone()
      .find("a")
      .remove()
      .end()
      .text()
      .replace(/[\s,–-]/g, "");
    return $b.is("p, ul, ol") && $b.find("a").length > 0 && nonLinkText.length === 0;
  };
  let removedLinkList = false;
  for (const el of $content.children().toArray()) {
    if (isLinkOnly(el)) {
      $(el).remove();
      removedLinkList = true;
    }
  }

  const NAV_TEXT = /^(read|learn|see|check|find)\b.*\b(more|other|related)\b/i;
  const blocks = $content.children().toArray();
  for (let i = blocks.length - 1; i >= 0; i--) {
    const $b = $(blocks[i]);
    const text = $b.text().trim();
    const introducesList = removedLinkList && $b.is("p") && text.endsWith(":");
    if (introducesList || ($b.is("p") && NAV_TEXT.test(text))) $b.remove();
    else break;
  }

  // Bordes de negritas/cursivas: espacios, puntuación y <br> van fuera de la etiqueta.
  //   "<strong>make </strong>in"  → "<strong>make</strong> in"
  //   "garden<strong>, and</strong>" → "garden, <strong>and</strong>"
  // (Markdown no permite "**make **in" ni abrir "**" entre una letra y una coma)
  const EDGE = /(?:\s|&nbsp;|<br\s*\/?>|[,.;:!?])+/;
  const LEAD = new RegExp(`^${EDGE.source}`);
  const TRAIL = new RegExp(`${EDGE.source}$`);
  $content.find("strong, b, em, i").each((_, el) => {
    const $el = $(el);
    const html = $el.html() ?? "";
    const lead = html.match(LEAD)?.[0];
    const trail = html.match(TRAIL)?.[0];
    if (!lead && !trail) return;
    const inner = html.replace(LEAD, "").replace(TRAIL, "");
    if (!inner.trim()) {
      $el.replaceWith(html); // la etiqueta solo tenía puntuación o espacios
      return;
    }
    $el.html(inner);
    // un espacio de separación si el borde era solo espacio (o terminaba en él)
    if (lead) $el.before(/\S$/.test(lead.replace(/&nbsp;/g, " ")) ? `${lead} ` : lead);
    if (trail) $el.after(trail.replace(/&nbsp;/g, " "));
  });

  // Enlaces: a la URL nueva, o texto plano si el destino ya no existe
  $content.find("a").each((_, a) => {
    const $a = $(a);
    const href = rewriteHref($a.attr("href") ?? "", legacyFile);
    if (href) $a.attr("href", href);
    else {
      report.warnings.push(`${legacyFile}: enlace eliminado → ${$a.attr("href")}`);
      $a.replaceWith($a.contents());
    }
  });

  // Títulos: sin <strong> dentro (en Markdown saldría "## **Título**")
  $content.find("h2, h3, h4, h5, h6").each((_, h) => {
    $(h)
      .find("strong, b")
      .each((__, s) => {
        $(s).replaceWith($(s).contents());
      });
  });

  $content.children("p").each((_, p) => {
    if (!$(p).text().trim() && !$(p).find("img").length) $(p).remove();
  });

  // Títulos que se han quedado sin contenido debajo (tras quitar la navegación)
  const level = (el: Element | undefined) => Number(el?.name.match(/^h([2-6])$/)?.[1] ?? 0);
  for (const h of $content.children("h2, h3, h4, h5, h6").toArray().reverse()) {
    const next = $(h).next().get(0);
    if (!next || (level(next) > 0 && level(next) <= level(h))) $(h).remove();
  }
  return $content;
}

async function migrateLesson(file: string, order: number) {
  const legacyFile = toPosix(path.relative(LEGACY, file)); // lessons/grammar/articles.html
  const [, section = "", ...rest] = legacyFile.replace(/\.html$/, "").split("/");
  const slug = rest.join("/");
  const $ = load(await readFile(file, "utf8"));
  const title = $("article.lesson > h1").first().text().trim();
  const $content = cleanContent($, legacyFile);
  const blocks = $content.children().toArray() as Element[];
  const base = { title, order, legacyPath: legacyFile };

  const list = extractWordList($, blocks);
  if (list) {
    const data = {
      kind: "wordlist" as const,
      ...base,
      ...(list.intro.length ? { intro: list.intro.join("\n\n") } : {}),
      groups: list.groups,
    };
    const parsed = WordList.safeParse(data);
    if (!parsed.success) report.warnings.push(`${legacyFile}: ${parsed.error.message}`);
    const out = path.join(OUT, "wordlists", section, `${slug}.json`);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, `${JSON.stringify(data, null, 2)}\n`);
    report.wordlists.push(`${section}/${slug}`);
    return;
  }

  // Artículo: tablas a JSON y párrafos centrados (ejemplos) a <Examples>
  const imports: string[] = [];
  for (const [i, table] of $content.find("table").toArray().entries()) {
    const n = i + 1;
    const data = tableToContent($, table);
    const parsed = RawTable.safeParse(data);
    if (!parsed.success) report.warnings.push(`${legacyFile} tabla ${n}: ${parsed.error.message}`);
    const rel = `tables/${section}/${slug}-${n}.json`;
    imports.push(`import table${n} from "@/content/${rel}";`);
    await mkdir(path.dirname(path.join(OUT, rel)), { recursive: true });
    await writeFile(path.join(OUT, rel), `${JSON.stringify(data, null, 2)}\n`);
    report.tables++;
    $(table).replaceWith(`<p>EFYTABLE${n}EFY</p>`);
  }

  $content.children("p.has-text-align-center").each((_, p) => {
    const $p = $(p);
    const html = $p.html() ?? "";
    const onlyBold =
      $p.children().length === 1 &&
      $p.children("strong").length === 1 &&
      $p.text().trim() === $p.children("strong").text().trim();
    if (onlyBold || $p.find("a").length) return; // subtítulo o enlaces: se queda como párrafo
    const lines = html
      .split(/<br\s*\/?>/i)
      .filter((l) => load(`<div>${l}</div>`).root().text().trim());
    $p.replaceWith(
      `<p>EFYEXSTART</p><ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul><p>EFYEXEND</p>`,
    );
  });

  const meta = { kind: "article" as const, ...base };
  const parsedMeta = ArticleMeta.safeParse(meta);
  if (!parsedMeta.success) report.warnings.push(`${legacyFile}: ${parsedMeta.error.message}`);

  const frontmatter = Object.entries(meta)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");
  const body = await htmlToMdx($content.html() ?? "");
  const mdx = `---\n${frontmatter}\n---\n\n${imports.length ? `${imports.join("\n")}\n\n` : ""}${body}\n`;

  const out = path.join(OUT, "lessons", section, `${slug}.mdx`);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, mdx);
  report.articles.push(`${section}/${slug}`);
}

// ---------- main ----------

// Se regenera todo desde cero para que no queden archivos de una ejecución anterior
for (const dir of ["lessons", "wordlists", "tables"])
  await rm(path.join(OUT, dir), { recursive: true, force: true });

const files = (await walk(path.join(LEGACY, "lessons"))).filter((f) => {
  const rel = toPosix(path.relative(path.join(LEGACY, "lessons"), f));
  return !rel.endsWith("index.html") && !SKIP_SECTIONS.has(rel.split("/")[0] ?? "");
});

// Orden: índices de sección + subpáginas de las lecciones padre
const orderOf = new Map<string, number>();
const indexFiles = (await walk(path.join(LEGACY, "lessons"))).filter((f) =>
  f.endsWith("index.html"),
);
for (const f of [...indexFiles, ...files]) {
  (await linkOrder(toPosix(path.relative(LEGACY, f)))).forEach((url, i) => {
    if (!orderOf.has(url)) orderOf.set(url, i + 1);
  });
}

for (const file of files.sort()) {
  const rel = toPosix(path.relative(path.join(LEGACY, "lessons"), file)).replace(/\.html$/, "");
  await migrateLesson(file, orderOf.get(`/biblioteca/${rel}`) ?? 999);
}

console.log(
  `${files.length} lecciones → ${report.articles.length} artículos (MDX) + ${report.wordlists.length} listas (JSON), ${report.tables} tablas`,
);
console.log(`\nListas: ${report.wordlists.join(", ")}`);
if (report.warnings.length) {
  console.log(`\n${report.warnings.length} avisos:`);
  for (const w of report.warnings) console.log(`  - ${w}`);
}
