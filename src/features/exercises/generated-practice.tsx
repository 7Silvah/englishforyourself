import { Link } from "@tanstack/react-router";
import { FlaskConical, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getTenseInfo } from "@/content/data/tense-index";
import { es } from "@/i18n/es";
import { generateIrregularSet } from "./generators/irregular-verbs";
import { generateTenseSet } from "./generators/tenses";
import { ExerciseSession } from "./player/exercise-session";

// Semilla nueva en cada ronda (aquí sí queremos azar: los ejercicios deben cambiar)
const newSeed = () => Math.random().toString(36).slice(2, 10);

// Práctica generada: un tiempo verbal (con su id) o los verbos irregulares
export function GeneratedPractice({ topic }: { topic: string }) {
  const [seed, setSeed] = useState(newSeed);
  const tense = getTenseInfo(topic);
  const set = useMemo(
    () => (tense ? generateTenseSet(tense, seed) : generateIrregularSet(seed)),
    [tense, seed],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={set.titleEs} description={set.instructionEs}>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Badge variant="secondary">{set.level}</Badge>
          <Button variant="outline" size="sm" onClick={() => setSeed(newSeed())}>
            <RefreshCw data-icon="inline-start" aria-hidden />
            {es.generated.newRound}
          </Button>
          {tense && (
            <Link
              to="/herramientas/tense-lab"
              search={{ tense: tense.id }}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <FlaskConical data-icon="inline-start" aria-hidden />
              {es.generated.openLab}
            </Link>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{es.generated.notSaved}</p>
      </PageHeader>
      {/* key: cada semilla es un set distinto, así que la sesión empieza de cero */}
      <ExerciseSession
        key={seed}
        setId={`generado-${topic}`}
        items={set.items}
        mode="practice"
        record={false}
      />
    </div>
  );
}
