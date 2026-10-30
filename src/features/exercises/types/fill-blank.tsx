import { Fragment } from "react";
import { Input } from "@/components/ui/input";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { splitBlanks } from "../solution";
import { statusClasses, type ItemProps } from "./item-props";

// Frase con huecos: un <input> por cada "___", dentro del propio texto
export function FillBlank({ item, response, onChange, result, locked }: ItemProps<"fill-blank">) {
  const parts = splitBlanks(item.text);

  function setValue(index: number, value: string) {
    const values = item.blanks.map((_, i) => (i === index ? value : (response.values[i] ?? "")));
    onChange({ ...response, values });
  }

  return (
    <p lang="en" className="text-lg leading-[2.6]">
      {parts.map((part, i) => {
        const blank = i - 1;
        const status = result?.parts?.[blank];
        return (
          <Fragment key={i}>
            {i > 0 && (
              <Input
                value={response.values[blank] ?? ""}
                onChange={(e) => setValue(blank, e.target.value)}
                readOnly={locked}
                autoFocus={blank === 0}
                aria-label={es.exercises.player.blank(blank + 1)}
                aria-invalid={status === "wrong" || undefined}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                // field-sizing: el hueco crece con lo que escribes (sin pistas de longitud)
                className={cn(
                  "mx-1 inline-block field-sizing-content h-9 w-auto max-w-full min-w-28 align-baseline text-lg md:text-lg",
                  status && statusClasses[status],
                )}
              />
            )}
            {part}
          </Fragment>
        );
      })}
    </p>
  );
}
