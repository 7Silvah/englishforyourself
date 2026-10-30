import { Link } from "@tanstack/react-router";
import { RotateCcw, Repeat } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { responseText, solutionText } from "../solution";
import { summarize, type ItemRecord } from "./logic";

const t = es.exercises.result;

type Props = {
  records: readonly ItemRecord[];
  onRetryFailed: () => void;
  onRestart: () => void;
  nextSet?: { id: string; titleEs: string };
};

export function ResultScreen({ records, onRetryFailed, onRestart, nextSet }: Props) {
  const { correct, total, percent, failed } = summarize(records);
  const message = percent === 100 ? t.perfect : percent >= 70 ? t.good : t.keepGoing;

  return (
    <section aria-labelledby="result-title" className="space-y-6">
      <div className="space-y-1 rounded-lg border bg-muted/30 p-6 text-center">
        {/* tabIndex -1 + autoFocus: el foco salta aquí y el lector de pantalla lee la nota */}
        <h2
          id="result-title"
          tabIndex={-1}
          autoFocus
          className="text-lg font-semibold outline-none"
        >
          {t.title}
        </h2>
        <p className="text-4xl font-bold tabular-nums">{percent} %</p>
        <p className="text-muted-foreground">{t.score(correct, total)}</p>
        <p className="pt-2">{message}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {failed.length > 0 && (
          <Button onClick={onRetryFailed}>
            <Repeat data-icon="inline-start" aria-hidden />
            {t.retryFailed}
          </Button>
        )}
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw data-icon="inline-start" aria-hidden />
          {t.restart}
        </Button>
        {nextSet && (
          <Link
            to="/ejercicios/$id"
            params={{ id: nextSet.id }}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {t.nextSet}: {nextSet.titleEs}
          </Link>
        )}
        <Link to="/ejercicios" className={cn(buttonVariants({ variant: "ghost" }))}>
          {t.backToList}
        </Link>
      </div>

      {failed.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">{t.mistakes}</h3>
          {failed.map(({ item, response }) => (
            <Card key={item.id} size="sm">
              <CardContent className="space-y-1">
                <p lang="en" className="font-medium">
                  {solutionText(item)}
                </p>
                <p className="text-sm text-wrong-fg">
                  {t.yourAnswer} <span lang="en">{responseText(item, response) || t.noAnswer}</span>
                </p>
                {item.explanationEs && (
                  <p className="text-sm text-muted-foreground">{item.explanationEs}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
