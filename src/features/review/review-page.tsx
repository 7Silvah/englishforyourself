import { ArrowLeft, Repeat, Shuffle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExerciseSet, getUnits } from "@/content";
import type { UnitBlock } from "@/content/schema";
import type { ExerciseItem, ExerciseSet } from "@/features/exercises/schema";
import { ExerciseSession } from "@/features/exercises/player/exercise-session";
import { useProgressStore } from "@/features/progress/store";
import { es } from "@/i18n/es";
import {
  masteredUnits,
  mistakeItems,
  mixedItems,
  mixedSetIds,
  pendingMistakes,
  REVIEW_LIMIT,
  reviewOutcomes,
} from "./logic";

const t = es.review;

type Session = { key: string; title: string; hint?: string; items: ExerciseItem[] };

const newSeed = () => Math.random().toString(36).slice(2, 10);

// Carga los cuerpos de varios sets (cada uno se descarga solo la primera vez)
async function loadSets(ids: readonly string[]): Promise<Map<string, ExerciseSet>> {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const entry = getExerciseSet(id);
      return entry ? ([id, await entry.load()] as const) : undefined;
    }),
  );
  return new Map(entries.filter((e) => e !== undefined));
}

// /repaso: "Repasar mis errores" y el repaso mixto por bloque del curso
export function ReviewPage() {
  const mistakes = useProgressStore((state) => state.mistakes);
  const attempts = useProgressStore((state) => state.attempts);
  const recordReview = useProgressStore((state) => state.recordReview);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const pending = pendingMistakes(mistakes);
  const blocks = new Map<UnitBlock, ReturnType<typeof getUnits>>();
  for (const unit of getUnits())
    blocks.set(unit.meta.block, [...(blocks.get(unit.meta.block) ?? []), unit]);

  // Se cargan los sets al pulsar: es la respuesta a un clic, no hace falta un efecto
  async function start(
    title: string,
    hint: string | undefined,
    build: () => Promise<ExerciseItem[]>,
  ) {
    setLoading(true);
    try {
      const items = await build();
      if (items.length > 0) setSession({ key: newSeed(), title, hint, items });
    } finally {
      setLoading(false);
    }
  }

  if (session)
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSession(null)}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          {t.back}
        </Button>
        <div>
          <h2 className="font-heading text-2xl font-bold">{session.title}</h2>
          {session.hint && <p className="text-muted-foreground">{session.hint}</p>}
        </div>
        <ExerciseSession
          key={session.key}
          setId="repaso"
          items={session.items}
          mode="practice"
          record={false}
          onFinished={(records) =>
            recordReview(
              reviewOutcomes(
                records.map((r) => ({ item: r.item, correct: r.result.status === "correct" })),
              ),
            )
          }
        />
      </div>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="review-mistakes" className="space-y-3 rounded-xl border p-5">
        <h2
          id="review-mistakes"
          className="flex items-center gap-2 font-heading text-xl font-semibold"
        >
          <Repeat className="size-5 text-primary" aria-hidden />
          {t.mistakes.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.mistakes.explain}</p>
        {pending.length === 0 ? (
          <p className="font-medium">{t.mistakes.empty}</p>
        ) : (
          <>
            <p className="font-medium">{t.mistakes.pending(pending.length)}</p>
            <Button
              disabled={loading}
              onClick={() =>
                void start(t.mistakes.session, t.mistakes.sessionHint, async () => {
                  const ids = [...new Set(pending.slice(0, REVIEW_LIMIT).map((m) => m.setId))];
                  return mistakeItems(pending, await loadSets(ids));
                })
              }
            >
              {loading ? t.loading : t.mistakes.start(Math.min(pending.length, REVIEW_LIMIT))}
            </Button>
          </>
        )}
      </section>

      <section aria-labelledby="review-mixed" className="space-y-3 rounded-xl border p-5">
        <h2
          id="review-mixed"
          className="flex items-center gap-2 font-heading text-xl font-semibold"
        >
          <Shuffle className="size-5 text-primary" aria-hidden />
          {t.mixed.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.mixed.explain}</p>
        <ul className="space-y-3">
          {[...blocks].map(([block, units]) => {
            const mastered = masteredUnits(units, attempts);
            const name = es.course.blocks[block];
            return (
              <li
                key={block}
                className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 p-3"
              >
                <span className="font-medium">{name}</span>
                <Badge variant="outline">{t.mixed.units(mastered.length)}</Badge>
                {mastered.length > 0 ? (
                  <Button
                    size="sm"
                    className="ml-auto"
                    disabled={loading}
                    onClick={() =>
                      void start(t.mixed.session(name), undefined, async () =>
                        mixedItems(await loadSets(mixedSetIds(mastered)), newSeed()),
                      )
                    }
                  >
                    {t.mixed.start}
                  </Button>
                ) : (
                  <span className="w-full text-sm text-muted-foreground">{t.mixed.locked}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
