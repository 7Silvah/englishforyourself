import { useMemo } from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { es } from "@/i18n/es";
import { choiceDisplay } from "../check";
import { ChoiceOption } from "./choice-option";
import type { ItemProps } from "./item-props";
import { ListenControls } from "./listen-controls";

const t = es.exercises.types.listenChoose;

// Escuchar y elegir: como opción múltiple, pero la pregunta se oye en vez de leerse
export function ListenChoose({
  item,
  response,
  onChange,
  result,
  locked,
  seed,
}: ItemProps<"listen-choose">) {
  const order = useMemo(() => choiceDisplay(item, seed), [item, seed]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <ListenControls text={item.audioText} />
      <RadioGroup
        aria-label={t.instruction}
        value={response.choice}
        onValueChange={(value: unknown) =>
          onChange({ ...response, choice: typeof value === "number" ? value : null })
        }
        disabled={locked}
      >
        {order.map((index) => (
          <ChoiceOption
            key={index}
            value={index}
            lang="en"
            state={
              !result
                ? null
                : index === item.answer
                  ? "correct"
                  : index === response.choice
                    ? "wrong"
                    : null
            }
          >
            {item.options[index]}
          </ChoiceOption>
        ))}
      </RadioGroup>
    </div>
  );
}
