import { ArrowLeft, Lightbulb } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { es } from "@/i18n/es";
import {
  checkItem,
  emptyResponse,
  hasAnswer,
  type CheckResult,
  type ExerciseItem,
  type ItemResponse,
} from "../check";
import { Feedback } from "./feedback";
import { ItemView } from "./item-view";
import { finalResult, type ItemRecord, type Mode } from "./logic";

const t = es.exercises.player;

type Props = {
  item: ExerciseItem;
  mode: Mode;
  seed: string;
  isLast: boolean;
  /** Respuesta con la que empieza (al volver a una pregunta del examen) */
  initialResponse?: ItemResponse;
  onDone: (record: ItemRecord) => void;
  /** Volver a la pregunta anterior (solo en examen); recibe lo escrito hasta ahora */
  onBack?: (response: ItemResponse) => void;
};

// Un ítem en pantalla. El player lo monta con key={item.id}: al pasar al siguiente,
// React crea uno nuevo y todo este estado empieza de cero (o con initialResponse).
export function ItemStep({ item, mode, seed, isLast, initialResponse, onDone, onBack }: Props) {
  const [response, setResponse] = useState(() => initialResponse ?? emptyResponse(item));
  const [result, setResult] = useState<CheckResult | null>(null);
  const [retried, setRetried] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [warnEmpty, setWarnEmpty] = useState(false);

  // "Casi" deja seguir escribiendo; correcto o incorrecto bloquean la respuesta
  const locked = result !== null && result.status !== "almost";

  function check() {
    if (!hasAnswer(response)) {
      setWarnEmpty(true);
      return;
    }
    setWarnEmpty(false);
    const checked = finalResult(checkItem(item, response), { mode, retried });
    if (checked.status === "almost") setRetried(true);
    // En examen no se enseña la corrección: se guarda y se pasa al siguiente
    if (mode === "exam") onDone({ item, response, result: checked });
    else setResult(checked);
  }

  // Enter = comprobar y, después, siguiente
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked && result) onDone({ item, response, result });
    else check();
  }

  // Los radios de Base UI son botones: Enter no envía el formulario por sí solo
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (
      event.key === "Enter" &&
      event.target instanceof HTMLElement &&
      event.target.getAttribute("role") === "radio"
    ) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  }

  const nextLabel = isLast ? t.finish : t.next;

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
      <ItemView
        item={item}
        response={response}
        onChange={setResponse}
        result={result}
        locked={locked}
        seed={seed}
      />

      {item.hintEs && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={showHint}
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb data-icon="inline-start" aria-hidden />
            {t.hint}
          </Button>
          {showHint && <p className="text-sm text-muted-foreground">{item.hintEs}</p>}
        </div>
      )}

      {/* Región "aria-live": los lectores de pantalla anuncian la corrección al aparecer */}
      <div aria-live="polite" className="space-y-2">
        {result && <Feedback item={item} result={result} />}
        {warnEmpty && <p className="text-sm text-muted-foreground">{t.emptyAnswer}</p>}
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        {onBack ? (
          <Button type="button" variant="outline" size="lg" onClick={() => onBack(response)}>
            <ArrowLeft data-icon="inline-start" aria-hidden />
            {t.previous}
          </Button>
        ) : (
          <span />
        )}
        {/* Botones distintos (key) para que "Siguiente" reciba el foco al aparecer */}
        {locked || mode === "exam" ? (
          <Button key="next" type="submit" size="lg" autoFocus={locked}>
            {nextLabel}
          </Button>
        ) : (
          <Button key="check" type="submit" size="lg">
            {t.check}
          </Button>
        )}
      </div>
    </form>
  );
}
