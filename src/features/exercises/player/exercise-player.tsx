import { useState } from "react";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { es } from "@/i18n/es";
import type { ExerciseItem, ItemResponse } from "../check";
import { ItemStep } from "./item-step";
import type { ItemRecord, Mode } from "./logic";

// Copia con un valor en la posición i (también si aún no existe: Array.with no lo permite)
function setAt<T>(list: readonly T[], i: number, value: T): T[] {
  const copy = [...list];
  copy[i] = value;
  return copy;
}

type Props = {
  setId: string;
  items: readonly ExerciseItem[];
  mode: Mode;
  onFinish: (records: ItemRecord[]) => void;
};

// Un ítem por pantalla. En práctica solo se avanza: cada respuesta se corrige al momento.
// En examen (la prueba de nivel) no hay corrección hasta el final, así que se puede volver
// a una pregunta anterior y cambiar la respuesta: por eso las respuestas se guardan por
// posición y el índice es un estado propio.
export function ExercisePlayer({ setId, items, mode, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [records, setRecords] = useState<(ItemRecord | undefined)[]>([]);
  // Lo escrito en una pregunta que se dejó sin responder al volver atrás
  const [drafts, setDrafts] = useState<(ItemResponse | undefined)[]>([]);
  const item = items[index];
  if (!item) return null;

  const isLast = index === items.length - 1;

  function handleDone(record: ItemRecord) {
    const all = setAt(records, index, record);
    // Al terminar, todas las anteriores están respondidas: solo se avanza respondiendo
    const done = all.filter((r): r is ItemRecord => r !== undefined);
    if (isLast && done.length === items.length) onFinish(done);
    else {
      setRecords(all);
      setIndex(index + 1);
    }
  }

  function handleBack(response: ItemResponse) {
    setDrafts(setAt(drafts, index, response));
    setIndex(index - 1);
  }

  return (
    <div className="space-y-6">
      <Progress value={(100 * index) / items.length}>
        <ProgressLabel className="text-muted-foreground">
          {es.exercises.player.progress(index + 1, items.length)}
        </ProgressLabel>
      </Progress>
      {/* key: cada pregunta es un ItemStep nuevo; al volver, empieza con la respuesta que
          ya tenía (la enviada o el borrador) */}
      <ItemStep
        key={item.id}
        item={item}
        mode={mode}
        seed={`${setId}#${item.id}`}
        isLast={isLast}
        initialResponse={records[index]?.response ?? drafts[index]}
        onDone={handleDone}
        onBack={mode === "exam" && index > 0 ? handleBack : undefined}
      />
    </div>
  );
}
