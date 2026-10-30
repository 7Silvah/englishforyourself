import { useMemo } from "react";
import type { RawTable } from "@/content/schema";
import { normalizeTable, type TableCell } from "@/content/table";
import { cn } from "@/lib/utils";
import { InlineText } from "./inline-text";
import { toneSoft, toneSolid } from "./tones";

function CellContent({ cell }: { cell: TableCell }) {
  if (cell.lines.length === 1 && cell.lines[0] && !cell.lines[0].tone) {
    const line = cell.lines[0];
    return (
      <span className={cn((line.formula || cell.formula) && "font-medium")}>
        <InlineText text={line.text} />
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {cell.lines.map((line, i) => (
        <span
          key={i}
          className={cn(
            line.tone && "rounded px-1.5 py-0.5",
            line.tone && toneSoft[line.tone],
            (line.formula || cell.formula) && "font-medium",
          )}
        >
          <InlineText text={line.text} />
        </span>
      ))}
    </div>
  );
}

// Tabla de contenido. "data" es el JSON importado en el MDX (validado por content:check).
export function GrammarTable({ data }: { data: RawTable }) {
  const table = useMemo(() => normalizeTable(data), [data]);
  const grammar = table.variant === "grammar";
  // Con muchas columnas, en móvil es mejor deslizar la tabla que aplastar el texto
  const columns = Math.max(...[...table.head, ...table.body].map((row) => row.length));

  return (
    <figure className="my-6 overflow-x-auto rounded-lg border">
      <table
        className={cn("w-full border-collapse text-sm", columns > 3 && "min-w-[36rem]")}
        lang="en"
      >
        {table.caption && (
          <caption className="border-b bg-muted/50 px-3 py-2 text-left font-semibold">
            {table.caption}
          </caption>
        )}
        {table.head.length > 0 && (
          <thead>
            {table.head.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <th
                    key={c}
                    scope="col"
                    rowSpan={cell.rowSpan}
                    colSpan={cell.colSpan}
                    className={cn(
                      "border-b px-3 py-2 text-left align-bottom font-semibold",
                      cell.tone ? toneSolid[cell.tone] : grammar && "bg-muted",
                    )}
                  >
                    <CellContent cell={cell} />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody>
          {table.body.map((row, r) => (
            <tr key={r} className="border-b last:border-b-0 even:bg-muted/30">
              {row.map((cell, c) => {
                const Tag = cell.header ? "th" : "td";
                return (
                  <Tag
                    key={c}
                    scope={cell.header ? "row" : undefined}
                    rowSpan={cell.rowSpan}
                    colSpan={cell.colSpan}
                    className={cn(
                      "px-3 py-2 text-left align-top",
                      cell.header && "font-semibold",
                      cell.tone && toneSoft[cell.tone],
                    )}
                  >
                    <CellContent cell={cell} />
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
