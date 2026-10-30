import { useMemo } from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { es } from "@/i18n/es";
import { choiceDisplay } from "../check";
import { ChoiceOption } from "./choice-option";
import type { ItemProps } from "./item-props";

export function MultipleChoice({
  item,
  response,
  onChange,
  result,
  locked,
  seed,
}: ItemProps<"multiple-choice">) {
  const order = useMemo(() => choiceDisplay(item, seed), [item, seed]);

  return (
    <div className="space-y-4">
      <p lang="en" className="text-lg">
        {item.prompt}
      </p>
      <RadioGroup
        aria-label={es.exercises.types.multipleChoice}
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
