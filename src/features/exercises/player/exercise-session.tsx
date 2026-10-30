import { useMemo, useState } from "react";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import { isSupported, type SupportedItem } from "../check";
import type { ExerciseItem } from "../schema";
import { ExercisePlayer } from "./exercise-player";
import type { ItemRecord, Mode } from "./logic";
import { ResultScreen } from "./result-screen";

type Props = {
  setId: string;
  items: readonly ExerciseItem[];
  mode: Mode;
  nextSet?: { id: string; titleEs: string };
};

// Una sesión = varias rondas: la completa y, si quieres, otras solo con los fallados.
// Cada ronda nueva cambia "round" y con él la key del player, que empieza de cero.
export function ExerciseSession({ setId, items, mode, nextSet }: Props) {
  const all = useMemo(() => items.filter(isSupported), [items]);
  const [round, setRound] = useState<{ n: number; items: readonly SupportedItem[] }>({
    n: 0,
    items: all,
  });
  const [records, setRecords] = useState<ItemRecord[] | null>(null);
  const recordResults = useProgressStore((state) => state.recordResults);

  if (all.length === 0)
    return <p className="text-muted-foreground">{es.exercises.player.unsupported}</p>;

  function startRound(roundItems: readonly SupportedItem[]) {
    setRound({ n: round.n + 1, items: roundItems });
    setRecords(null);
  }

  function handleFinish(done: ItemRecord[]) {
    recordResults(
      setId,
      done.map((r) => ({ itemId: r.item.id, correct: r.result.status === "correct" })),
      round.items.length === all.length,
    );
    setRecords(done);
  }

  if (records)
    return (
      <ResultScreen
        records={records}
        onRetryFailed={() =>
          startRound(records.filter((r) => r.result.status !== "correct").map((r) => r.item))
        }
        onRestart={() => startRound(all)}
        nextSet={nextSet}
      />
    );

  return (
    <ExercisePlayer
      key={round.n}
      setId={setId}
      items={round.items}
      mode={mode}
      onFinish={handleFinish}
    />
  );
}
