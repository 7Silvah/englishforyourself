import { Link } from "@tanstack/react-router";
import { Layers, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Level } from "@/content/schema";
import { es } from "@/i18n/es";
import { generateVocabularySet, type VocabWord } from "./generators/vocabulary";
import { ExerciseSession } from "./player/exercise-session";

const newSeed = () => Math.random().toString(36).slice(2, 10);

// Práctica generada de una lista de vocabulario: ejercicios nuevos en cada ronda
export function VocabularyPractice({
  listPath,
  title,
  level,
  words,
}: {
  listPath: string;
  title: string;
  level: Level;
  words: readonly VocabWord[];
}) {
  const [seed, setSeed] = useState(newSeed);
  const set = useMemo(
    () => generateVocabularySet(title, level, words, seed),
    [title, level, words, seed],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{level}</Badge>
        <Button variant="outline" size="sm" onClick={() => setSeed(newSeed())}>
          <RefreshCw data-icon="inline-start" aria-hidden />
          {es.generated.newRound}
        </Button>
        <Link
          to="/practicar/flashcards"
          search={{ lista: listPath }}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <Layers data-icon="inline-start" aria-hidden />
          {es.generated.vocabulary.flashcards}
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">{es.generated.notSaved}</p>
      {/* key: cada semilla es un set distinto, así que la sesión empieza de cero */}
      <ExerciseSession
        key={seed}
        setId={`vocabulario-${listPath}`}
        items={set.items}
        mode="practice"
        record={false}
      />
    </div>
  );
}
