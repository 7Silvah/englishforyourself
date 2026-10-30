// Normalización de las celdas de tabla, sin Zod para que no pese en el navegador.
// La usan el esquema (al validar) y <GrammarTable> (al mostrar).
import type { RawCell, RawTable, Tone } from "./schema";

export type CellLine = { text: string; tone?: Tone; formula?: boolean };

export type TableCell = {
  lines: CellLine[];
  header: boolean;
  tone?: Tone;
  formula: boolean;
  rowSpan?: number;
  colSpan?: number;
};

export type Table = {
  caption?: string;
  variant: "grammar" | "plain";
  head: TableCell[][];
  body: TableCell[][];
};

// Una celda puede escribirse como texto simple o como objeto: aquí siempre sale completa
export function normalizeCell(cell: RawCell): TableCell {
  const obj = typeof cell === "string" ? { text: cell } : cell;
  const rawLines = obj.lines ?? (obj.text !== undefined && obj.text !== "" ? [obj.text] : []);
  return {
    lines: rawLines.map((l) => (typeof l === "string" ? { text: l } : l)),
    header: obj.header ?? false,
    tone: obj.tone,
    formula: obj.formula ?? false,
    rowSpan: obj.rowSpan,
    colSpan: obj.colSpan,
  };
}

export function normalizeTable(table: RawTable): Table {
  return {
    caption: table.caption,
    variant: table.variant ?? "grammar",
    head: (table.head ?? []).map((row) => row.map(normalizeCell)),
    body: table.body.map((row) => row.map(normalizeCell)),
  };
}
