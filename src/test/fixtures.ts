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

export const match: ItemOf<"match"> = {
  id: "mt",
  type: "match",
  pairs: [
    { left: "I", right: "am" },
    { left: "she", right: "is" },
    { left: "we", right: "are" },
  ],
};

export const categorize: ItemOf<"categorize"> = {
  id: "ct",
  type: "categorize",
  categories: [
    { label: "a", items: ["book", "car"] },
    { label: "an", labelEs: "sonido de vocal", items: ["apple", "hour"] },
  ],
};

export const translateBank: ItemOf<"translate"> = {
  id: "tlb",
  type: "translate",
  es: "Soy profesora.",
  answers: ["I am a teacher."],
  wordBank: ["I", "am", "a", "an", "teacher."],
};

export const translateTyped: ItemOf<"translate"> = {
  id: "tlt",
  type: "translate",
  es: "Tengo hambre.",
  answers: ["I am hungry."],
};

export const dictation: ItemOf<"dictation"> = {
  id: "dc",
  type: "dictation",
  text: "Where do you live?",
};

export const tableFill: ItemOf<"table-fill"> = {
  id: "tb",
  type: "table-fill",
  columns: ["Positive", "Negative"],
  rows: [
    { header: "she", cells: ["She works.", { answers: ["She doesn't work."] }] },
    { header: "they", cells: [{ answers: ["They work."] }, "They don't work."] },
  ],
};

export const listenChoose: ItemOf<"listen-choose"> = {
  id: "lc",
  type: "listen-choose",
  audioText: "I can't swim.",
  options: ["I can't swim.", "I can swim."],
  answer: 0,
};
