// Detecta si una lección es una lista de palabras/expresiones y la extrae.
//
// Patrones del sitio antiguo:
//   vocabulario:            <h2>Mammals</h2><p class="has-text-align-center">Bat<br>Bear<br>…</p>
//   collocations, ways:     <h2>…</h2><ol><li>Make a call</li>…</ol>
//   phrasal verbs, idioms:  <ol><li><strong>To get along</strong>: to have … <ul><li>…</li></ul></li></ol>
//
// Una lección es "wordlist" si, tras los párrafos de introducción, todo son títulos
// seguidos de listas. Si aparece cualquier otra cosa (tabla, prosa…), es "article".
import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";

type Word = { en: string; meanings?: string[] };
type Group = { title?: string; items: Word[] };

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const isList = (el: Element) => el.name === "ol" || el.name === "ul";
const isHeading = (el: Element) => /^h[2-6]$/.test(el.name);

function brLines($: CheerioAPI, p: Element): string[] {
  return ($(p).html() ?? "")
    .split(/<br\s*\/?>/i)
    .map((chunk) => clean($(`<div>${chunk}</div>`).text()))
    .filter(Boolean);
}

function listItems($: CheerioAPI, list: Element): Word[] {
  return $(list)
    .children("li")
    .toArray()
    .map((li) => {
      const $li = $(li);
      const nested = $li
        .children("ul, ol")
        .find("li")
        .toArray()
        .map((n) => clean($(n).text()))
        .filter(Boolean);
      const $own = $li.clone();
      $own.children("ul, ol").remove();
      const strong = $own.children("strong").first();
      if (strong.length) {
        const en = clean(strong.text()).replace(/:$/, "");
        strong.remove();
        const rest = clean($own.text()).replace(/^:\s*/, "");
        const meanings = [rest, ...nested]
          .filter(Boolean)
          .map((m) => m.charAt(0).toUpperCase() + m.slice(1));
        return meanings.length ? { en, meanings } : { en };
      }
      const en = clean($own.text());
      return nested.length ? { en, meanings: nested } : { en };
    })
    .filter((w) => w.en);
}

// Devuelve null si la lección no encaja en el patrón de lista
export function extractWordList(
  $: CheerioAPI,
  blocks: Element[],
): { intro: string[]; groups: Group[] } | null {
  const intro: string[] = [];
  let i = 0;
  while (
    i < blocks.length &&
    blocks[i]?.name === "p" &&
    !$(blocks[i]).hasClass("has-text-align-center")
  ) {
    intro.push(clean($(blocks[i]).text()));
    i++;
  }

  const groups: Group[] = [];
  let current: Group | null = null;
  for (; i < blocks.length; i++) {
    const el = blocks[i];
    if (!el) continue;
    if (isHeading(el)) {
      current = { title: clean($(el).text()).replace(/:$/, ""), items: [] };
      groups.push(current);
    } else if (isList(el) || (el.name === "p" && $(el).hasClass("has-text-align-center"))) {
      if (!current) {
        current = { items: [] };
        groups.push(current);
      }
      const words = isList(el) ? listItems($, el) : brLines($, el).map((en) => ({ en }));
      current.items.push(...words);
    } else {
      return null; // otra cosa: no es una lista
    }
  }
  // Un título sin palabras debajo suele ser el título general ("Health vocabulary")
  // seguido de subtítulos con sus listas: se ignora.
  const filled = groups.filter((g) => g.items.length > 0);
  return filled.length > 0 ? { intro, groups: filled } : null;
}
