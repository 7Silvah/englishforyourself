import { useState } from "react";
import {
  emptyResponse,
  type CheckResult,
  type ExerciseItem,
  type ItemResponse,
} from "@/features/exercises/check";
import { ItemView } from "@/features/exercises/player/item-view";

// Guarda la respuesta en estado, como hace el player, y avisa de cada cambio
export function Harness({
  item,
  result = null,
  onChange,
}: {
  item: ExerciseItem;
  result?: CheckResult | null;
  onChange?: (response: ItemResponse) => void;
}) {
  const [response, setResponse] = useState(() => emptyResponse(item));
  return (
    <ItemView
      item={item}
      response={response}
      onChange={(next) => {
        setResponse(next);
        onChange?.(next);
      }}
      result={result}
      locked={result !== null}
      seed="test"
    />
  );
}
