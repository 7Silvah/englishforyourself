import type { CheckResult, ItemResponse, SupportedItem } from "../check";
import { ErrorCorrection } from "../types/error-correction";
import { FillBlank } from "../types/fill-blank";
import { MultipleChoice } from "../types/multiple-choice";
import { Transform } from "../types/transform";
import { TrueFalse } from "../types/true-false";
import { WordOrder } from "../types/word-order";

type Props = {
  item: SupportedItem;
  response: ItemResponse;
  onChange: (response: ItemResponse) => void;
  result: CheckResult | null;
  locked: boolean;
  seed: string;
};

// Elige el componente según item.type. El "switch" sobre la unión discriminada hace
// que TypeScript sepa qué campos tiene cada ítem dentro de cada "case".
export function ItemView({ item, response, ...rest }: Props) {
  switch (item.type) {
    case "fill-blank":
      return (
        <FillBlank
          item={item}
          response={response.type === item.type ? response : { type: item.type, values: [] }}
          {...rest}
        />
      );
    case "multiple-choice":
      return (
        <MultipleChoice
          item={item}
          response={response.type === item.type ? response : { type: item.type, choice: null }}
          {...rest}
        />
      );
    case "true-false":
      return (
        <TrueFalse
          item={item}
          response={response.type === item.type ? response : { type: item.type, choice: null }}
          {...rest}
        />
      );
    case "word-order":
      return (
        <WordOrder
          item={item}
          response={response.type === item.type ? response : { type: item.type, tokens: [] }}
          {...rest}
        />
      );
    case "transform":
      return (
        <Transform
          item={item}
          response={response.type === item.type ? response : { type: item.type, text: "" }}
          {...rest}
        />
      );
    case "error-correction":
      return (
        <ErrorCorrection
          item={item}
          response={
            response.type === item.type ? response : { type: item.type, token: null, text: "" }
          }
          {...rest}
        />
      );
  }
}
