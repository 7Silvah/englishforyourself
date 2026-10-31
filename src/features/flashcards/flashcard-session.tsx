import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, Check, RotateCcw, X } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { SpeakButton } from "@/components/lesson/speak-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { dayKey } from "@/features/progress/logic";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { buildSession, type Card } from "./logic";
import { useFlashcardStore } from "./store";

const t = es.flashcards;

const newSeed = () => Math.random().toString(36).slice(2, 10);

// Una tarjeta que no sabías vuelve al final de la sesión, como mucho estas veces
const MAX_REPEATS = 2;

// ¿Está el foco en un control? Entonces Espacio y Enter son de ese control, no atajos
function isControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement && ["BUTTON", "INPUT", "SELECT", "A"].includes(target.tagName)
  );
}

export function FlashcardSession({ cards }: { cards: readonly Card[] }) {
  const answer = useFlashcardStore((state) => state.answer);
  // La sesión se arma una vez con el estado de ese momento; las respuestas no la cambian
  const [queue, setQueue] = useState(() =>
    buildSession(cards, useFlashcardStore.getState().cards, dayKey(new Date()), newSeed()),
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false); // false: inglés → español
  const [score, setScore] = useState({ knew: 0, didNot: 0 });
  const current = queue[index];

  function respond(knew: boolean) {
    if (!current) return;
    answer(current.key, knew);
    setScore((s) => (knew ? { ...s, knew: s.knew + 1 } : { ...s, didNot: s.didNot + 1 }));
    if (!knew && queue.filter((c) => c.key === current.key).length <= MAX_REPEATS)
      setQueue([...queue, current]);
    setFlipped(false);
    setIndex(index + 1);
  }

  function restart() {
    setQueue(
      buildSession(cards, useFlashcardStore.getState().cards, dayKey(new Date()), newSeed()),
    );
    setIndex(0);
    setFlipped(false);
    setScore({ knew: 0, didNot: 0 });
  }

  // useEffectEvent: el efecto se suscribe al teclado una sola vez, pero el manejador
  // siempre ve el estado actual (la tarjeta en pantalla, si está girada…)
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (!current || isControl(event.target)) return;
    if (event.key === " " && !flipped) {
      event.preventDefault();
      setFlipped(true);
    } else if (flipped && event.key === "1") respond(false);
    else if (flipped && event.key === "2") respond(true);
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  if (queue.length === 0)
    return (
      <div className="space-y-4 rounded-xl border p-6 text-center">
        <p className="font-medium">{t.nothingToday}</p>
        <Link to="/practicar/flashcards" className={buttonVariants({ variant: "outline" })}>
          {t.backToDecks}
        </Link>
      </div>
    );

  if (!current)
    return (
      <section aria-labelledby="fc-done" className="space-y-4 rounded-xl border p-6 text-center">
        {/* El foco salta aquí al terminar, para que el lector de pantalla lo anuncie */}
        <h2
          id="fc-done"
          tabIndex={-1}
          autoFocus
          className="font-heading text-xl font-bold outline-none"
        >
          {t.done}
        </h2>
        <p className="text-muted-foreground">{t.score(score.knew, score.didNot)}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={restart}>
            <RotateCcw data-icon="inline-start" aria-hidden />
            {t.again}
          </Button>
          <Link to="/practicar/flashcards" className={buttonVariants({ variant: "outline" })}>
            {t.backToDecks}
          </Link>
        </div>
      </section>
    );

  const front = reverse ? current.es : current.en;
  const back = reverse ? current.en : current.es;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Progress value={(100 * index) / queue.length} className="w-40">
          <ProgressLabel className="text-muted-foreground">
            {t.progress(index + 1, queue.length)}
          </ProgressLabel>
        </Progress>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={reverse}
          onClick={() => {
            setReverse(!reverse);
            setFlipped(false);
          }}
        >
          <ArrowLeftRight data-icon="inline-start" aria-hidden />
          {reverse ? t.esToEn : t.enToEs}
        </Button>
      </div>

      <div className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border-2 bg-card p-6 text-center shadow-sm">
        <p className="flex items-center gap-2 font-heading text-3xl font-bold">
          <span lang={reverse ? "es" : "en"}>{front}</span>
          {!reverse && <SpeakButton text={current.en} />}
        </p>
        {/* aria-live: al girar la tarjeta, el lector de pantalla lee la respuesta */}
        <div aria-live="polite" className="min-h-10">
          {flipped && (
            <p className="flex items-center gap-2 text-2xl text-muted-foreground">
              <span lang={reverse ? "en" : "es"}>{back}</span>
              {reverse && <SpeakButton text={current.en} />}
            </p>
          )}
        </div>
      </div>

      {!flipped ? (
        <Button size="lg" className="w-full" onClick={() => setFlipped(true)}>
          {t.show} <kbd className="ml-2 rounded border px-1 text-xs opacity-70">{t.keySpace}</kbd>
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="outline"
            className={cn("border-wrong-border")}
            onClick={() => respond(false)}
          >
            <X data-icon="inline-start" aria-hidden />
            {t.didNotKnow} <kbd className="ml-1 rounded border px-1 text-xs opacity-70">1</kbd>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={cn("border-correct-border")}
            onClick={() => respond(true)}
          >
            <Check data-icon="inline-start" aria-hidden />
            {t.knew} <kbd className="ml-1 rounded border px-1 text-xs opacity-70">2</kbd>
          </Button>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">{t.keysHint}</p>
    </div>
  );
}
