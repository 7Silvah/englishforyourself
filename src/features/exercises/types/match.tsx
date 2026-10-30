import { Check, X } from "lucide-react";
import { useMemo } from "react";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { matchDisplay } from "../check";
import { statusClasses, type ItemProps } from "./item-props";

const t = es.exercises.types.match;

// Emparejar: una fila por elemento de la izquierda, con un <select> para elegir su pareja.
// El <select> nativo funciona con teclado y lector de pantalla sin trabajo extra.
export function Match({ item, response, onChange, result, locked, seed }: ItemProps<"match">) {
  const order = useMemo(() => matchDisplay(item, seed), [item, seed]);

  function choose(left: number, value: string) {
    const pairs = item.pairs.map((_, i) =>
      i === left ? (value === "" ? null : Number(value)) : (response.pairs[i] ?? null),
    );
    onChange({ ...response, pairs });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <ul className="space-y-2">
        {item.pairs.map((pair, i) => {
          const status = result?.parts?.[i];
          const chosen = response.pairs[i];
          return (
            <li key={pair.left} className="flex flex-wrap items-center gap-3">
              <span className="min-w-28 font-medium">{pair.left}</span>
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
              <select
                aria-label={t.pairOf(pair.left)}
                value={chosen === null || chosen === undefined ? "" : String(chosen)}
                onChange={(e) => choose(i, e.target.value)}
                disabled={locked}
                className={cn(
                  "h-10 min-w-40 rounded-lg border border-input bg-background px-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-100",
                  status && statusClasses[status],
                )}
              >
                <option value="">{t.choose}</option>
                {order.map((r) => (
                  <option key={r} value={r}>
                    {item.pairs[r]?.right}
                  </option>
                ))}
              </select>
              {status === "correct" && <Check className="size-5 text-correct-fg" aria-hidden />}
              {status === "wrong" && <X className="size-5 text-wrong-fg" aria-hidden />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
