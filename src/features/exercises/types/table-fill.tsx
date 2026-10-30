import { Input } from "@/components/ui/input";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { tableBlanks } from "../check";
import { statusClasses, type ItemProps } from "./item-props";

const t = es.exercises.types.tableFill;

// Completar una tabla (por ejemplo, afirmativa / negativa / pregunta de un tiempo verbal).
// Las celdas con texto se muestran tal cual; las que piden respuesta son campos de texto.
export function TableFill({ item, response, onChange, result, locked }: ItemProps<"table-fill">) {
  const blanks = tableBlanks(item);
  // Posición de cada hueco en response.values: "fila-columna" → índice
  const blankIndex = new Map(blanks.map((b, i) => [`${b.row}-${b.col}`, i]));

  function setValue(index: number, value: string) {
    onChange({
      ...response,
      values: blanks.map((_, i) => (i === index ? value : (response.values[i] ?? ""))),
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <div className="overflow-x-auto rounded-lg border">
        <table lang="en" className="w-full border-collapse text-sm">
          {item.caption && (
            <caption className="border-b bg-muted/50 px-3 py-2 text-left font-semibold">
              {item.caption}
            </caption>
          )}
          <thead>
            <tr>
              <td className="border-b bg-muted" />
              {item.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b bg-muted px-3 py-2 text-left font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.rows.map((row, r) => (
              <tr key={row.header} className="border-b last:border-b-0">
                <th scope="row" className="px-3 py-2 text-left font-semibold">
                  {row.header}
                </th>
                {row.cells.map((cell, c) => {
                  const index = blankIndex.get(`${r}-${c}`);
                  if (typeof cell === "string" || index === undefined)
                    return (
                      <td key={c} className="px-3 py-2">
                        {typeof cell === "string" ? cell : ""}
                      </td>
                    );
                  const status = result?.parts?.[index];
                  return (
                    <td key={c} className="px-2 py-1.5">
                      <Input
                        value={response.values[index] ?? ""}
                        onChange={(e) => setValue(index, e.target.value)}
                        readOnly={locked}
                        autoFocus={index === 0}
                        aria-label={t.cell(row.header, item.columns[c] ?? "")}
                        aria-invalid={status === "wrong" || undefined}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className={cn("h-9 min-w-32 text-base", status && statusClasses[status])}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
