import { useState } from "react";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { es } from "@/i18n/es";
import type { SupportedItem } from "../check";
import { ItemStep } from "./item-step";
import type { ItemRecord, Mode } from "./logic";

type Props = {
  setId: string;
  items: readonly SupportedItem[];
  mode: Mode;
  onFinish: (records: ItemRecord[]) => void;
};

// Un ítem por pantalla. El índice no se guarda aparte: es cuántos ítems ya están respondidos.
export function ExercisePlayer({ setId, items, mode, onFinish }: Props) {
  const [records, setRecords] = useState<ItemRecord[]>([]);
  const index = records.length;
  const item = items[index];
  if (!item) return null;

  function handleDone(record: ItemRecord) {
    const all = [...records, record];
    if (all.length === items.length) onFinish(all);
    else setRecords(all);
  }

  return (
    <div className="space-y-6">
      <Progress value={(100 * index) / items.length}>
        <ProgressLabel className="text-muted-foreground">
          {es.exercises.player.progress(index + 1, items.length)}
        </ProgressLabel>
      </Progress>
      <ItemStep
        key={item.id}
        item={item}
        mode={mode}
        seed={`${setId}#${item.id}`}
        isLast={index === items.length - 1}
        onDone={handleDone}
      />
    </div>
  );
}
