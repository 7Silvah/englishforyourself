// Extrae las wordlists de Face2Face (PDF locales, fuera del repo).
// Uso: npx tsx scripts/face2face-extract.ts [--content [--force]]
// Lee de docs/Cambridg…Face2Face…/ y escribe la extracción completa (con el ruso) en
// .face2face/, ignorada por Git: el material tiene derechos (docs/PLAN.md F17c, §15).
// Con --content genera además las listas de src/content/wordlists/vocabulary-by-level/.
// Después se editan a mano (traducciones de V3): sin --force no se sobrescriben.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractTextItems, getDocumentProxy } from "unpdf";
import { PartOfSpeech, type Level, type Word, type WordList } from "@/content/schema";

const OUT_DIR = ".face2face";
const CONTENT_DIR = "src/content/wordlists/vocabulary-by-level";

type Source = {
  id: string;
  file: string;
  slug: string;
  level: Level;
  title: string;
  titleEs: string;
};

const SOURCES: Source[] = [
  {
    id: "starter",
    file: "Starter wordlist.pdf",
    slug: "starter-a1",
    level: "A1",
    title: "Starter Vocabulary",
    titleEs: "Vocabulario A1 · Starter",
  },
  {
    id: "elementary",
    file: "2 Elementary/F2F-II_Elemn__Russian Vokab.pdf",
    slug: "elementary-a2",
    level: "A2",
    title: "Elementary Vocabulary",
    titleEs: "Vocabulario A2 · Elementary",
  },
  {
    id: "intermediate",
    file: "4 Intermediate/F2F-II_Interm_wordlist.pdf",
    slug: "intermediate-b1",
    level: "B1",
    title: "Intermediate Vocabulary",
    titleEs: "Vocabulario B1 · Intermediate",
  },
];

// Cabecera del PDF → campo del JSON
const HEADERS: Record<string, Field> = {
  ENGLISH: "en",
  "Pronunciation (UK)": "ipa",
  Pronunciation: "ipa",
  PoS: "pos",
  RUSSIAN: "ru",
  Definition: "definition",
  Example: "example",
  Lesson: "lesson",
};
type Field = "en" | "ipa" | "pos" | "ru" | "definition" | "example" | "lesson";

type RawEntry = Partial<Record<Field, string>> & { page: number; cut?: true };

const POS = new Set<string>(PartOfSpeech.options);
const isPos = (s: string): s is PartOfSpeech => POS.has(s);

type Piece = { x: number; y: number; end: number; str: string };

async function findSourceDir(): Promise<string> {
  const dir = (await readdir("docs")).find(
    (d) => d.startsWith("Cambridg") && d.includes("Face2Face"),
  );
  if (!dir) throw new Error("No encuentro docs/Cambridge Face2Face…/");
  return path.join("docs", dir);
}

// Une los trozos de una celda: en la misma línea, pegados si se tocan (el PDF
// parte «(какая» «-» «нибудь)»); en líneas distintas, con un espacio.
function joinCell(pieces: Piece[]): string {
  let text = "";
  let prev: Piece | undefined;
  for (const p of pieces) {
    const sameLine = prev && Math.abs(prev.y - p.y) < 2;
    const touching = sameLine && prev && p.x - prev.end < 1;
    text += prev && !touching ? " " + p.str : p.str;
    prev = p;
  }
  return text.replace(/\s+/g, " ").trim();
}

async function extract(file: string): Promise<RawEntry[]> {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(file)));
  const [, , pageWidth = 0] = (await pdf.getPage(1)).view;
  const { items: pages } = await extractTextItems(pdf);

  // Las columnas salen de la cabecera de la primera página (misma x en todas).
  let columns: { x: number; field: Field }[] = [];
  const entries: RawEntry[] = [];

  for (const [i, items] of pages.entries()) {
    const n = i + 1;
    const pieces: Piece[] = items
      .filter((it) => it.str.trim() !== "")
      .map((it) => ({ x: it.x, y: it.y, end: it.x + it.width, str: it.str }));

    if (n === 1) {
      const header = pieces.filter((p) => p.str.trim() in HEADERS);
      columns = header
        .map((p) => ({ x: p.x, field: HEADERS[p.str.trim()]! }))
        .sort((a, b) => a.x - b.x);
      const headerY = Math.min(...header.map((p) => p.y));
      pieces.splice(0, pieces.length, ...pieces.filter((p) => p.y < headerY - 2));
    }

    // El PDF guarda el texto celda a celda y fila a fila: empieza una fila nueva
    // cuando el texto vuelve a una columna anterior.
    let row: Map<number, Piece[]> = new Map();
    let prevCol = -1;
    let firstOfPage = true;
    const flush = () => {
      if (row.size === 0) return;
      const entry: RawEntry = { page: n };
      for (const [col, ps] of row) {
        const field = columns[col]!.field;
        entry[field] = joinCell(ps);
        // En Starter y Elementary hay definiciones que se salen de la página: el
        // propio PDF las corta («…because they have done s»).
        if (field === "definition" && ps.some((p) => p.end >= pageWidth - 2)) entry.cut = true;
      }
      // Una fila partida entre dos páginas: el trozo sin inglés sigue a la anterior.
      const prev = entries.at(-1);
      if (firstOfPage && !entry.en && prev) {
        for (const c of columns) {
          const more = entry[c.field];
          if (more) prev[c.field] = prev[c.field] ? `${prev[c.field]} ${more}` : more;
        }
        if (entry.cut) prev.cut = true;
      } else {
        entries.push(entry);
      }
      firstOfPage = false;
      row = new Map();
    };
    for (const p of pieces) {
      const col = columns.findLastIndex((c) => c.x <= p.x + 1);
      if (col < 0) continue;
      if (col < prevCol) flush();
      row.set(col, [...(row.get(col) ?? []), p]);
      prevCol = col;
    }
    flush();
  }

  // A veces el tipo cae un poco a la izquierda de su columna y se pega a la IPA.
  for (const e of entries) {
    const m = !e.pos && e.ipa?.match(/^(.*\S)\s+([a-z ]+)$/);
    if (m && POS.has(m[2]!)) [e.ipa, e.pos] = [m[1], m[2]];
  }
  return entries;
}

function problems(e: RawEntry): string[] {
  const out: string[] = [];
  if (!e.en) out.push("sin inglés");
  if (!e.ipa) out.push("sin IPA");
  if (!e.pos) out.push("sin tipo");
  else if (!isPos(e.pos)) out.push(`tipo raro «${e.pos}»`);
  if (e.ru && !/[а-яё]/i.test(e.ru) && e.ru !== "-" && e.ru !== e.en) out.push("ruso sin cirílico");
  if (e.ipa && /[а-яё]/i.test(e.ipa)) out.push("cirílico en la IPA");
  if (e.lesson && !/^\d{1,2}[A-D]$/.test(e.lesson)) out.push(`lección rara «${e.lesson}»`);
  return out;
}

// IPA del PDF → IPA limpia. Starter pone «X» donde va una cifra («X jɪəz əˈgəʊ»):
// esa pronunciación no sirve y se deja vacía.
function cleanIpa(ipa: string | undefined): string | undefined {
  if (!ipa || ipa.includes("X")) return undefined;
  return ipa
    .replaceAll("'", "ˈ") // apóstrofo en lugar del acento primario
    .replaceAll("g", "ɡ") // la g del IPA es ɡ (U+0261), no la g latina
    .replace(/\s*\/\s*/g, " / ");
}

// Las filas de una misma palabra y tipo (otro sentido, otra lección) se juntan en una
// entrada con varios `meanings`: la flashcard y el buscador ven una sola palabra.
function toWords(entries: RawEntry[]): { words: Word[]; merged: number; cut: number } {
  const byKey = new Map<string, Word>();
  let merged = 0;
  let cut = 0;
  for (const e of entries) {
    if (!e.en || !e.pos || !isPos(e.pos)) continue;
    if (e.cut) cut++;
    const meaning = e.definition && !e.cut ? e.definition : undefined;
    const key = `${e.en}|${e.pos}`;
    const word = byKey.get(key);
    if (!word) {
      byKey.set(key, {
        en: e.en,
        ipa: cleanIpa(e.ipa),
        pos: e.pos,
        meanings: meaning ? [meaning] : undefined,
        example: e.example,
      });
      continue;
    }
    merged++;
    word.ipa ??= cleanIpa(e.ipa);
    if (meaning && !word.meanings?.includes(meaning))
      word.meanings = [...(word.meanings ?? []), meaning];
    word.example ??= e.example;
  }
  return { words: [...byKey.values()], merged, cut };
}

// Grupos por letra inicial, sin el paréntesis del principio («(too) many» va en la M);
// las cifras, en «0–9».
function groupByLetter(words: Word[]): WordList["groups"] {
  const groups = new Map<string, Word[]>();
  for (const w of words) {
    const first =
      w.en
        .replace(/^\([^)]*\)\s*/, "")
        .match(/[a-z0-9]/i)?.[0]
        ?.toUpperCase() ?? "#";
    const title = /\d/.test(first) ? "0–9" : first;
    groups.set(title, [...(groups.get(title) ?? []), w]);
  }
  // «0–9» delante de la A, y las letras en orden aunque el PDF empiece por «(any) idea»
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([title, items]) => ({ title, items }));
}

async function writeContent(src: Source, entries: RawEntry[], force: boolean) {
  const file = path.join(CONTENT_DIR, `${src.slug}.json`);
  if (existsSync(file) && !force) {
    console.log(`  ${file} ya existe: no se toca (usa --force para regenerarlo)`);
    return;
  }
  const { words, merged, cut } = toWords(entries);
  const list: WordList = {
    kind: "wordlist",
    title: src.title,
    titleEs: src.titleEs,
    level: src.level,
    order: SOURCES.indexOf(src) + 1,
    source: "face2face",
    introEs: `Las palabras del nivel ${src.level}, con su pronunciación británica (IPA), el tipo de palabra y lo que significan en inglés.`,
    reviewed: false,
    groups: groupByLetter(words),
  };
  await mkdir(CONTENT_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(list, null, 2) + "\n");
  console.log(
    `  ${file}: ${words.length} palabras (${merged} filas juntadas con otra, ${cut} definiciones cortadas fuera)`,
  );
}

const args = process.argv.slice(2);
const dir = await findSourceDir();
await mkdir(OUT_DIR, { recursive: true });
for (const src of SOURCES) {
  const file = path.join(dir, src.file);
  if (!existsSync(file)) {
    console.log(`✗ ${src.id}: falta ${file}`);
    continue;
  }
  const entries = await extract(file);
  const report = entries.flatMap((e) => {
    const p = problems(e);
    return p.length ? [`  p.${e.page} «${e.en ?? "?"}»: ${p.join(", ")}`] : [];
  });
  await writeFile(path.join(OUT_DIR, `${src.id}.json`), JSON.stringify(entries, null, 2) + "\n");
  console.log(`${src.id}: ${entries.length} entradas, ${report.length} con avisos`);
  if (report.length) console.log(report.join("\n"));
  if (args.includes("--content")) await writeContent(src, entries, args.includes("--force"));
}
