import { Link } from "@tanstack/react-router";
import { BookOpen, PencilLine } from "lucide-react";
import { useState } from "react";
import { blockClasses, toneSolid } from "@/components/lesson/tones";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { TENSES, type TenseId } from "@/content/data/tense-index";
import { getTenseChart } from "@/content/data/tenses";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { piecesFromBlocks } from "./conjugate";
import { SentenceBlocks } from "./sentence-blocks";
import { SentenceBuilder } from "./sentence-builder";

const t = es.tenseLab;
const MOODS = ["pos", "neg", "q"] as const;

// Tense Lab: la estructura de cada tiempo en bloques de color, con un selector de sujeto
// y un constructor de frases. El tiempo elegido vive en la URL (?tense=).
export function TenseLab({ tense }: { tense: TenseId }) {
  const info = TENSES.find((x) => x.id === tense);
  const chart = getTenseChart(tense);
  // El sujeto elegido solo importa mientras miras este tiempo: estado local
  const [groupId, setGroupId] = useState(chart?.groups[0]?.id);
  if (!info || !chart) return null;
  const group = chart.groups.find((g) => g.id === groupId) ?? chart.groups[0];
  if (!group) return null;
  const [section, ...slug] = info.lesson.split("/");

  return (
    <div className="space-y-8">
      <nav aria-label={t.chooseTense}>
        <ul className="flex flex-wrap gap-2">
          {TENSES.map((x) => (
            <li key={x.id}>
              <Link
                to="/herramientas/tense-lab"
                search={{ tense: x.id }}
                aria-current={x.id === tense ? "page" : undefined}
                className={cn(
                  "block rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted",
                  x.id === tense &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {x.nameEs}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="tense-title" className="space-y-5 rounded-xl border p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="tense-title" className="font-heading text-2xl font-bold">
              {info.nameEs}
            </h2>
            <p lang="en" className="text-muted-foreground">
              {info.name}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{info.level}</Badge>
            <Link
              to="/biblioteca/$section/$"
              params={{ section: section ?? "", _splat: slug.join("/") }}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <BookOpen data-icon="inline-start" aria-hidden />
              {t.lesson}
            </Link>
            <Link
              to="/ejercicios/practicar/$tema"
              params={{ tema: tense }}
              className={buttonVariants({ size: "sm" })}
            >
              <PencilLine data-icon="inline-start" aria-hidden />
              {t.practice}
            </Link>
          </div>
        </div>

        {chart.groups.length > 1 ? (
          <div role="group" aria-label={t.subject} className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{t.subject}:</span>
            {chart.groups.map((g) => (
              <Button
                key={g.id}
                type="button"
                size="sm"
                variant={g.id === group.id ? "default" : "outline"}
                aria-pressed={g.id === group.id}
                lang="en"
                onClick={() => setGroupId(g.id)}
              >
                {g.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.allSubjects}</p>
        )}

        <div className="space-y-3">
          {MOODS.map((mood) => {
            const row = group.moods[mood];
            return (
              <div
                key={mood}
                className="grid gap-3 rounded-lg border p-3 md:grid-cols-[8rem_1fr_1fr]"
              >
                <span
                  className={cn(
                    "self-start rounded px-2 py-1 text-center text-sm font-semibold",
                    toneSolid[mood],
                  )}
                >
                  {es.lesson.modes[mood]}
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {t.structure}
                  </p>
                  <SentenceBlocks pieces={piecesFromBlocks(row.rule)} swap={row.swap} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">{t.example}</p>
                  <SentenceBlocks pieces={piecesFromBlocks(row.ex)} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="sr-only">{t.legend}:</span>
          {(["subj", "aux", "verb", "obj"] as const).map((role) => (
            <span key={role} className={cn("rounded-md border px-2 py-0.5", blockClasses[role])}>
              {t.roles[role]}
            </span>
          ))}
        </p>
      </section>

      <SentenceBuilder tense={tense} />
    </div>
  );
}
