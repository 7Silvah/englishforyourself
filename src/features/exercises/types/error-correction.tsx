import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { sentenceTokens, wrongTokenIndices } from "../check";
import { statusClasses, type ItemProps } from "./item-props";

const t = es.exercises.types.errorCorrection;

// Dos pasos: tocar la palabra incorrecta (botones con aria-pressed) y escribir la corrección
export function ErrorCorrection({
  item,
  response,
  onChange,
  result,
  locked,
}: ItemProps<"error-correction">) {
  const words = useMemo(() => sentenceTokens(item.sentence), [item]);
  const wrong = useMemo(() => new Set(wrongTokenIndices(item)), [item]);
  const [found, fixed] = result?.parts ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <div role="group" aria-label={t.words} lang="en" className="flex flex-wrap gap-1.5">
        {words.map((word, i) => {
          const selected = response.token === i;
          return (
            <Button
              key={i}
              type="button"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              disabled={locked}
              className={cn(
                "h-9 text-base disabled:opacity-100",
                // Tras corregir, se marca dónde estaba el error
                result && wrong.has(i) && statusClasses.correct,
                result && selected && !wrong.has(i) && statusClasses.wrong,
              )}
              onClick={() => onChange({ ...response, token: selected ? null : i })}
            >
              {word}
            </Button>
          );
        })}
      </div>
      <label className="block space-y-2">
        <span className="text-sm">
          {t.input}
          {response.token !== null && (
            <>
              {" "}
              ({t.wrongWord}: <strong lang="en">{words[response.token]}</strong>)
            </>
          )}
        </span>
        <Input
          value={response.text}
          onChange={(e) => onChange({ ...response, text: e.target.value })}
          readOnly={locked}
          lang="en"
          placeholder={response.token === null ? t.selectFirst : undefined}
          aria-invalid={fixed === "wrong" || undefined}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            "h-10 text-lg md:text-lg",
            found === "correct" && fixed && statusClasses[fixed],
            found === "wrong" && statusClasses.wrong,
          )}
        />
      </label>
    </div>
  );
}
