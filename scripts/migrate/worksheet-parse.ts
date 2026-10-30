// Extrae y parsea el texto de los worksheets PDF del sitio antiguo.
// Todos siguen el mismo formato:
//   Instruction: …
//   1. Frase con __________ (pista)
//   …
//   Answer key
//   1. respuesta
import { readFile } from "node:fs/promises";
import { extractText, getDocumentProxy } from "unpdf";

export type ParsedWorksheet = {
  instruction: string;
  items: { n: number; text: string; answer: string }[];
  warnings: string[];
};

export async function pdfText(file: string): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(file)));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

const NUMBERED = /^(\d+)\.\s*(.*)$/;

// Une las líneas que una frase ocupa al partirse en el PDF
function collectNumbered(lines: string[]): Map<number, string> {
  const result = new Map<number, string>();
  let current: number | null = null;
  for (const line of lines) {
    const m = line.match(NUMBERED);
    if (m?.[1] && m[2] !== undefined) {
      current = Number(m[1]);
      result.set(current, m[2].trim());
    } else if (current !== null) {
      result.set(current, `${result.get(current) ?? ""} ${line.trim()}`.trim());
    }
  }
  return result;
}

export function parseWorksheet(text: string): ParsedWorksheet {
  const warnings: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const instrStart = lines.findIndex((l) => /^Instruction:/i.test(l));
  const firstItem = lines.findIndex((l) => NUMBERED.test(l));
  const keyStart = lines.findIndex((l) => /^Answer key/i.test(l));
  if (instrStart < 0 || firstItem < 0 || keyStart < 0) {
    return { instruction: "", items: [], warnings: ["formato no reconocido"] };
  }

  const instruction = lines
    .slice(instrStart, firstItem)
    .join(" ")
    .replace(/^Instruction:\s*/i, "")
    .trim();
  const questions = collectNumbered(lines.slice(firstItem, keyStart));
  const answers = collectNumbered(lines.slice(keyStart + 1));

  const items: ParsedWorksheet["items"] = [];
  for (const [n, q] of questions) {
    const answer = answers.get(n);
    if (answer === undefined) warnings.push(`ítem ${n}: sin respuesta`);
    items.push({ n, text: q, answer: answer ?? "" });
  }
  for (const n of answers.keys()) if (!questions.has(n)) warnings.push(`respuesta ${n}: sin ítem`);
  return { instruction, items, warnings };
}
