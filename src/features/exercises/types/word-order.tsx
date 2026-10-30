import { useMemo } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { wordOrderDisplay, wordOrderTokens } from "../check";
import { statusClasses, type ItemProps } from "./item-props";

const t = es.exercises.types.wordOrder;

// La ficha tocada desaparece de su grupo; si se llevara el foco, quien usa teclado
// tendría que empezar a tabular desde arriba. Se pasa a la ficha vecina o, si no
// queda ninguna, al botón principal del formulario ("Comprobar").
function moveFocus(button: HTMLButtonElement) {
  const siblings = [...(button.parentElement?.querySelectorAll("button") ?? [])];
  const i = siblings.indexOf(button);
  const next = siblings[i + 1] ?? siblings[i - 1];
  const target = next ?? button.form?.querySelector<HTMLButtonElement>("button[type=submit]");
  target?.focus();
}

// Fichas que se tocan para ir formando la frase (arrastrar llega en F9).
// Cada ficha es un botón: funciona con Tab + Espacio/Enter.
export function WordOrder({
  item,
  response,
  onChange,
  result,
  locked,
  seed,
}: ItemProps<"word-order">) {
  const tokens = useMemo(() => wordOrderTokens(item), [item]);
  const order = useMemo(() => wordOrderDisplay(item, seed), [item, seed]);
  const chosen = new Set(response.tokens);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <div
        role="group"
        aria-label={t.answer}
        className={cn(
          "flex min-h-14 flex-wrap items-center gap-2 rounded-lg border-2 border-dashed p-3",
          result && statusClasses[result.status],
        )}
      >
        {response.tokens.length === 0 && (
          <span className="text-sm text-muted-foreground">{t.empty}</span>
        )}
        {response.tokens.map((index, position) => (
          <Button
            key={`${index}-${position}`}
            type="button"
            variant="secondary"
            lang="en"
            className="h-9 text-base"
            disabled={locked}
            aria-label={t.remove(tokens[index] ?? "")}
            onClick={(event) => {
              moveFocus(event.currentTarget);
              onChange({ ...response, tokens: response.tokens.filter((_, p) => p !== position) });
            }}
          >
            {tokens[index]}
          </Button>
        ))}
      </div>
      <div role="group" aria-label={t.bank} className="flex flex-wrap gap-2">
        {order.map((index) =>
          chosen.has(index) ? (
            // Hueco invisible del mismo tamaño: las demás fichas no se mueven de sitio
            <span
              key={index}
              aria-hidden
              className={cn(buttonVariants({ variant: "outline" }), "invisible h-9 text-base")}
            >
              {tokens[index]}
            </span>
          ) : (
            <Button
              key={index}
              type="button"
              variant="outline"
              lang="en"
              className="h-9 text-base"
              disabled={locked}
              onClick={(event) => {
                moveFocus(event.currentTarget);
                onChange({ ...response, tokens: [...response.tokens, index] });
              }}
            >
              {tokens[index]}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
