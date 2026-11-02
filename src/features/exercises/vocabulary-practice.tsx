import { Link } from "@tanstack/react-router";
import { Layers, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Level } from "@/content/schema";
import type { PracticeSearch } from "@/features/vocabulary/filters";
import { es } from "@/i18n/es";
import { generateCollocationSet } from "./generators/collocations";
import { generatePhrasalVerbSet } from "./generators/phrasal-verbs";
import { generateVocabularySet } from "./generators/vocabulary";
import { generateWaysToSaySet } from "./generators/ways-to-say";
import type { ListPractice } from "./list-practice";
import { ExerciseSession } from "./player/exercise-session";

const newSeed = () => Math.random().toString(36).slice(2, 10);

// Cada tipo de lista tiene su generador
function generate(title: string, level: Level, practice: ListPractice, seed: string) {
  switch (practice.kind) {
    case "vocabulary":
      return generateVocabularySet(title, level, practice.words, seed);
    case "phrasal-verbs":
      return generatePhrasalVerbSet(title, level, practice.words, seed);
    case "collocations":
      return generateCollocationSet(title, level, practice.verb, practice.lists, seed);
    case "ways-to-say":
      return generateWaysToSaySet(level, practice.current, practice.all, seed);
  }
}

// Práctica generada de una lista de la Biblioteca (o de lo filtrado en Vocabulario):
// ejercicios nuevos en cada ronda. `flashcards` es la búsqueda de sus flashcards, si las hay.
export function VocabularyPractice({
  id,
  title,
  level,
  practice,
  flashcards,
}: {
  id: string;
  title: string;
  level: Level;
  practice: ListPractice;
  flashcards?: PracticeSearch;
}) {
  const [seed, setSeed] = useState(newSeed);
  const set = useMemo(() => generate(title, level, practice, seed), [title, level, practice, seed]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{level}</Badge>
        <Button variant="outline" size="sm" onClick={() => setSeed(newSeed())}>
          <RefreshCw data-icon="inline-start" aria-hidden />
          {es.generated.newRound}
        </Button>
        {flashcards && (
          <Link
            to="/practicar/flashcards"
            search={flashcards}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <Layers data-icon="inline-start" aria-hidden />
            {es.generated.vocabulary.flashcards}
          </Link>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{set.instructionEs}</p>
      <p className="text-sm text-muted-foreground">{es.generated.notSaved}</p>
      {/* key: cada semilla es un set distinto, así que la sesión empieza de cero */}
      <ExerciseSession
        key={seed}
        setId={`vocabulario-${id}`}
        items={set.items}
        mode="practice"
        record={false}
      />
    </div>
  );
}
