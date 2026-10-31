import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { dayKey } from "@/features/progress/logic";
import { es } from "@/i18n/es";
import { MAX_BOX } from "./logic";
import { useFlashcardStore } from "./store";

// Resumen de las flashcards para /progreso. No se muestra si aún no has repasado ninguna.
export function FlashcardSummary() {
  const cards = useFlashcardStore((state) => state.cards);
  const [today] = useState(() => dayKey(new Date()));
  const states = Object.values(cards);
  if (states.length === 0) return null;
  const mastered = states.filter((s) => s.box === MAX_BOX).length;
  const due = states.filter((s) => s.due <= today).length;

  return (
    <section aria-labelledby="progress-flashcards" className="space-y-2 rounded-lg border p-4">
      <h2 id="progress-flashcards" className="font-semibold">
        {es.flashcards.summaryTitle}
      </h2>
      <p className="text-sm text-muted-foreground">
        {es.flashcards.summary(states.length, mastered, due)}
      </p>
      <Link
        to="/practicar/flashcards"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {es.flashcards.goToDecks}
      </Link>
    </section>
  );
}
