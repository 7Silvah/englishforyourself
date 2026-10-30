import { RadioGroup } from "@/components/ui/radio-group";
import { es } from "@/i18n/es";
import { ChoiceOption } from "./choice-option";
import type { ItemProps } from "./item-props";

const t = es.exercises.types.trueFalse;

export function TrueFalse({ item, response, onChange, result, locked }: ItemProps<"true-false">) {
  return (
    <div className="space-y-4">
      <p lang="en" className="rounded-lg bg-muted/50 p-4 text-lg">
        {item.statement}
      </p>
      <RadioGroup
        aria-label={t.question}
        value={response.choice}
        onValueChange={(value: unknown) =>
          onChange({ ...response, choice: typeof value === "boolean" ? value : null })
        }
        disabled={locked}
      >
        {[true, false].map((option) => (
          <ChoiceOption
            key={String(option)}
            value={option}
            state={
              !result
                ? null
                : option === item.answer
                  ? "correct"
                  : option === response.choice
                    ? "wrong"
                    : null
            }
          >
            {option ? t.true : t.false}
          </ChoiceOption>
        ))}
      </RadioGroup>
    </div>
  );
}
