import { useMemo } from "react";
import { es } from "@/i18n/es";
import { wordOrderDisplay, wordOrderTokens } from "../check";
import type { ItemProps } from "./item-props";
import { TileBuilder } from "./tile-builder";

// Ordenar fichas para formar la frase (tocar o arrastrar)
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
  return (
    <TileBuilder
      tokens={tokens}
      order={order}
      chosen={response.tokens}
      onChange={(tokens) => onChange({ ...response, tokens })}
      locked={locked}
      status={result?.status}
      instruction={es.exercises.types.wordOrder.instruction}
    />
  );
}
