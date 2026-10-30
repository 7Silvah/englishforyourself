import type { CheckResult, ExerciseItem, ItemResponse } from "../check";
import { Categorize } from "../types/categorize";
import { Dictation } from "../types/dictation";
import { ErrorCorrection } from "../types/error-correction";
import { FillBlank } from "../types/fill-blank";
import { ListenChoose } from "../types/listen-choose";
import { Match } from "../types/match";
import { MultipleChoice } from "../types/multiple-choice";
import { TableFill } from "../types/table-fill";
import { Transform } from "../types/transform";
import { Translate } from "../types/translate";
import { TrueFalse } from "../types/true-false";
import { WordOrder } from "../types/word-order";

type Props = {
  item: ExerciseItem;
  response: ItemResponse;
  onChange: (response: ItemResponse) => void;
  result: CheckResult | null;
  locked: boolean;
  seed: string;
};

// Elige el componente según item.type. El "switch" sobre la unión discriminada hace
// que TypeScript sepa qué campos tiene cada ítem dentro de cada "case". La respuesta
// siempre es del mismo tipo que el ítem (la crea emptyResponse); el valor de reserva
// solo existe para que TypeScript también lo sepa.
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
    case "match":
      return (
        <Match
          item={item}
          response={response.type === item.type ? response : { type: item.type, pairs: [] }}
          {...rest}
        />
      );
    case "categorize":
      return (
        <Categorize
          item={item}
          response={response.type === item.type ? response : { type: item.type, placed: [] }}
          {...rest}
        />
      );
    case "translate":
      return (
        <Translate
          item={item}
          response={
            response.type === item.type ? response : { type: item.type, text: "", tokens: [] }
          }
          {...rest}
        />
      );
    case "dictation":
      return (
        <Dictation
          item={item}
          response={response.type === item.type ? response : { type: item.type, text: "" }}
          {...rest}
        />
      );
    case "table-fill":
      return (
        <TableFill
          item={item}
          response={response.type === item.type ? response : { type: item.type, values: [] }}
          {...rest}
        />
      );
    case "listen-choose":
      return (
        <ListenChoose
          item={item}
          response={response.type === item.type ? response : { type: item.type, choice: null }}
          {...rest}
        />
      );
  }
}
