// <table> del sitio antiguo → objeto ContentTable (ver src/content/schema.ts).
// Las celdas guardan su texto con un formato mínimo: **negrita**, *cursiva*,
// [[pos:texto]] para palabras coloreadas, y una línea por cada <br> o <div>.
import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";

const TONES = ["pos", "neg", "q", "nq", "purple", "teal", "blue"] as const;
type Tone = (typeof TONES)[number];

function toneOf($el: Cheerio<Element>): Tone | undefined {
  const classes = ($el.attr("class") ?? "").split(/\s+/);
  return TONES.find((t) => classes.includes(`g-${t}`));
}

// Texto en línea con el formato mínimo
function inlineText($: CheerioAPI, nodes: Cheerio<AnyNode>): string {
  let out = "";
  nodes.each((_, node) => {
    if (node.type === "text") {
      out += node.data;
      return;
    }
    if (node.type !== "tag") return;
    const $n = $(node);
    const inner = inlineText($, $n.contents());
    const tone = toneOf($n);
    if (node.name === "strong" || node.name === "b")
      out += inner.trim() ? `**${inner.trim()}**` : inner;
    else if (node.name === "em" || node.name === "i")
      out += inner.trim() ? `*${inner.trim()}*` : inner;
    else if (node.name === "span" && tone) out += `[[${tone}:${inner}]]`;
    else if (node.name === "br") out += "\n";
    else out += inner; // span.formula, sup, a, u…: solo el texto
  });
  return out;
}

type Line = string | { text: string; tone?: Tone; formula?: boolean };

function cellLines($: CheerioAPI, $cell: Cheerio<Element>): Line[] {
  const divs = $cell.children("div");
  if (divs.length > 0) {
    return divs.toArray().map((div) => {
      const $d = $(div);
      const text = inlineText($, $d.contents()).trim();
      const tone = toneOf($d);
      return tone ? { text, tone } : text;
    });
  }
  const isFormula =
    $cell.find("span.formula").length > 0 && $cell.children().not("span.formula, br").length === 0;
  const lines = inlineText($, $cell.contents())
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return isFormula ? lines.map((text) => ({ text, formula: true })) : lines;
}

function cell($: CheerioAPI, el: Element, inBody: boolean) {
  const $c = $(el);
  const lines = cellLines($, $c);
  const out: Record<string, unknown> = {};
  const onlyLine = lines.length === 1 ? lines[0] : undefined;
  if (lines.length === 0) out.text = "";
  else if (typeof onlyLine === "string") out.text = onlyLine;
  else if (lines.length === 1 && onlyLine) Object.assign(out, onlyLine);
  else out.lines = lines;
  if (el.name === "th" && inBody) out.header = true;
  const tone = toneOf($c);
  if (tone) out.tone = tone;
  const rowSpan = Number($c.attr("rowspan") ?? 1);
  const colSpan = Number($c.attr("colspan") ?? 1);
  if (rowSpan > 1) out.rowSpan = rowSpan;
  if (colSpan > 1) out.colSpan = colSpan;
  // Una celda con solo texto se guarda como string, más fácil de leer y editar
  const keys = Object.keys(out);
  return keys.length === 1 && keys[0] === "text" ? (out.text as string) : out;
}

const isBold = (c: unknown) => typeof c === "string" && /^\*\*[^*]+\*\*$/.test(c);

export function tableToContent($: CheerioAPI, table: Element) {
  const $t = $(table);
  const variant = $t.hasClass("gtable") ? "grammar" : "plain";
  const caption = $t.children("caption").text().trim() || undefined;
  const rows = (selector: string, inBody: boolean) =>
    $t
      .find(selector)
      .toArray()
      .map((tr) =>
        $(tr)
          .children("th, td")
          .toArray()
          .map((c) => cell($, c, inBody)),
      );

  let head = rows("thead > tr", false);
  let body = rows("tbody > tr", true);
  if (body.length === 0) body = rows("> tr", true);

  // Tablas simples cuya primera fila es todo negrita: esa fila es el encabezado
  const first = body[0];
  if (variant === "plain" && head.length === 0 && first && first.every(isBold)) {
    head = [first.map((c) => (c as string).slice(2, -2))];
    body = body.slice(1);
  }
  return { ...(caption ? { caption } : {}), variant, head, body };
}
