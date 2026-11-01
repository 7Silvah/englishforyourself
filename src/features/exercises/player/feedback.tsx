import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { SpeakButton } from "@/components/shared/speak-button";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import type { CheckResult, Status, ExerciseItem } from "../check";
import { canListen, solutionSentence, solutionText } from "../solution";
import { statusClasses } from "../types/item-props";

const t = es.exercises.player;

const icons: Record<Status, typeof CircleCheck> = {
  correct: CircleCheck,
  almost: CircleAlert,
  wrong: CircleX,
};

// Corrección de un ítem: icono + texto (nunca solo color), la solución y el porqué
export function Feedback({ item, result }: { item: ExerciseItem; result: CheckResult }) {
  const Icon = icons[result.status];
  const listen = canListen(item);
  const showSolution = result.status === "wrong" || (result.status === "correct" && listen);

  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", statusClasses[result.status])}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-current/30">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="pt-1.5 font-semibold">{t[result.status]}</p>
        {showSolution && (
          <p className="flex flex-wrap items-center gap-x-2">
            {result.status === "wrong" && <span>{t.solution}</span>}
            <strong lang="en">{solutionText(item)}</strong>
            {listen && <SpeakButton text={solutionSentence(item)} />}
          </p>
        )}
        {result.status !== "almost" && item.explanationEs && (
          <p className="text-foreground">{item.explanationEs}</p>
        )}
      </div>
    </div>
  );
}
