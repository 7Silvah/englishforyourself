import type { ItemOf } from "@/features/exercises/check";

// Ítems de ejemplo para los tests (uno por tipo de F5)

export const fillBlank: ItemOf<"fill-blank"> = {
  id: "fb",
  type: "fill-blank",
  text: "I ___ (to travel) to Korea and ___ (to visit) Seoul.",
  blanks: [{ answers: ["travelled", "traveled"] }, { answers: ["visited"] }],
};

export const multipleChoice: ItemOf<"multiple-choice"> = {
  id: "mc",
  type: "multiple-choice",
  prompt: "She ___ coffee every morning.",
  options: ["drink", "drinks", "is drink"],
  answer: 1,
  explanationEs: "Con she, el verbo lleva -s.",
};

export const trueFalse: ItemOf<"true-false"> = {
  id: "tf",
  type: "true-false",
  statement: "I have 20 years.",
  answer: false,
};

export const wordOrder: ItemOf<"word-order"> = {
  id: "wo",
  type: "word-order",
  answers: ["Does she work here?", "Does she work here"],
  distractors: ["do"],
};

export const transform: ItemOf<"transform"> = {
  id: "tr",
  type: "transform",
  source: "She works here.",
  to: "neg",
  answers: ["She doesn't work here."],
};

export const errorCorrection: ItemOf<"error-correction"> = {
  id: "ec",
  type: "error-correction",
  sentence: "She don't like coffee.",
  wrong: "don't",
  answers: ["doesn't"],
};
