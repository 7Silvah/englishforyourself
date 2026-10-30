import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { translateDisplay } from "../check";
import { statusClasses, type ItemProps } from "./item-props";
import { TileBuilder } from "./tile-builder";

const t = es.exercises.types.translate;

// Traducir del español al inglés: con banco de palabras (fichas) o escribiendo
export function Translate({
  item,
  response,
  onChange,
  result,
  locked,
  seed,
}: ItemProps<"translate">) {
  const order = useMemo(() => translateDisplay(item, seed), [item, seed]);

  return (
    <div className="space-y-4">
      <p lang="es" className="rounded-lg bg-muted/50 p-4 text-lg">
        {item.es}
      </p>
      {item.wordBank ? (
        <TileBuilder
          tokens={item.wordBank}
          order={order}
          chosen={response.tokens}
          onChange={(tokens) => onChange({ ...response, tokens })}
          locked={locked}
          status={result?.status}
          instruction={t.tiles}
        />
      ) : (
        <label className="block space-y-2">
          <span className="text-sm">{t.instruction}</span>
          <Input
            value={response.text}
            onChange={(e) => onChange({ ...response, text: e.target.value })}
            readOnly={locked}
            autoFocus
            lang="en"
            placeholder={t.input}
            aria-invalid={result?.status === "wrong" || undefined}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn("h-10 text-lg md:text-lg", result && statusClasses[result.status])}
          />
        </label>
      )}
    </div>
  );
}
