import { useState } from "react";
import { useProgressStore } from "@/features/progress/store";
import { useEnglishVoice } from "@/hooks/use-english-voice";
import { es } from "@/i18n/es";
import { needsAudio, type ExerciseItem } from "../check";
import { ExercisePlayer } from "./exercise-player";
import type { ItemRecord, Mode } from "./logic";
import { ResultScreen } from "./result-screen";

type Props = {
  setId: string;
  items: readonly ExerciseItem[];
  mode: Mode;
  nextSet?: { id: string; titleEs: string };
  record?: boolean; // false en los sets generados: cambian cada vez y no tiene sentido guardarlos
};

// Una sesión = varias rondas: la completa y, si quieres, otras solo con los fallados.
// Cada ronda nueva cambia "round" y con él la key del player, que empieza de cero.
export function ExerciseSession({ setId, items, mode, nextSet, record = true }: Props) {
  const [round, setRound] = useState<{ n: number; items: readonly ExerciseItem[] }>({
    n: 0,
    items,
  });
  const [records, setRecords] = useState<ItemRecord[] | null>(null);
  const recordResults = useProgressStore((state) => state.recordResults);
  // Sin voces en inglés, los ítems de audio (dictado, escuchar y elegir) se saltan.
  // Se calcula en cada render: si las voces llegan un poco tarde, los ítems aparecen solos.
  const hasVoice = useEnglishVoice();
  const playable = round.items.filter((item) => hasVoice || !needsAudio(item));

  if (playable.length === 0)
    return <p className="text-muted-foreground">{es.exercises.player.noAudio}</p>;

  function startRound(roundItems: readonly ExerciseItem[]) {
    setRound({ n: round.n + 1, items: roundItems });
    setRecords(null);
  }

  function handleFinish(done: ItemRecord[]) {
    if (record)
      recordResults(
        setId,
        done.map((r) => ({ itemId: r.item.id, correct: r.result.status === "correct" })),
        round.items.length === items.length,
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
        onRestart={() => startRound(items)}
        nextSet={nextSet}
      />
    );

  return (
    <ExercisePlayer
      key={round.n}
      setId={setId}
      items={playable}
      mode={mode}
      onFinish={handleFinish}
    />
  );
}
