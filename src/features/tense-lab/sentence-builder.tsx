import { useState } from "react";
import { toneSoft, toneSolid } from "@/components/lesson/tones";
import type { TenseId } from "@/content/data/tense-index";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { conjugate, PRACTICE_VERBS, SUBJECTS, type Mood, type Subject } from "./conjugate";
import { SentenceBlocks } from "./sentence-blocks";

const MOODS: readonly Mood[] = ["pos", "neg", "q"];

const selectClass =
  "h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// "Construye tu frase": eliges sujeto y verbo y la frase se conjuga en las tres formas.
// No hay nada que guardar: la frase se calcula en cada render a partir de lo elegido.
export function SentenceBuilder({ tense }: { tense: TenseId }) {
  const [subject, setSubject] = useState<Subject>("she");
  const [verbIndex, setVerbIndex] = useState(0);
  const verb = PRACTICE_VERBS[verbIndex] ?? PRACTICE_VERBS[0];
  if (!verb) return null;

  return (
    <section aria-labelledby="builder" className="space-y-4 rounded-xl border p-4">
      <div>
        <h2 id="builder" className="font-heading text-xl font-semibold">
          {es.tenseLab.builder}
        </h2>
        <p className="text-sm text-muted-foreground">{es.tenseLab.builderHint}</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          {es.tenseLab.subject}
          <select
            lang="en"
            className={selectClass}
            value={subject}
            onChange={(e) => {
              const next = SUBJECTS.find((s) => s === e.target.value);
              if (next) setSubject(next);
            }}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          {es.tenseLab.verb}
          <select
            className={selectClass}
            value={verbIndex}
            onChange={(e) => setVerbIndex(Number(e.target.value))}
          >
            {PRACTICE_VERBS.map((v, i) => (
              <option key={v.base} value={i}>
                {v.base} {v.object} ({v.es})
              </option>
            ))}
          </select>
        </label>
      </div>
      <dl className="space-y-2" aria-live="polite">
        {MOODS.map((mood) => (
          <div
            key={mood}
            className={cn("flex flex-wrap items-center gap-3 rounded-lg p-2", toneSoft[mood])}
          >
            <dt
              className={cn(
                "w-24 shrink-0 rounded px-2 py-0.5 text-center text-sm font-semibold",
                toneSolid[mood],
              )}
            >
              {es.lesson.modes[mood]}
            </dt>
            <dd>
              <SentenceBlocks pieces={conjugate(tense, mood, subject, verb)} swap={mood === "q"} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
