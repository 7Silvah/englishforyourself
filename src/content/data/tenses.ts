// Tablas del Tense Lab: estructura y ejemplo de cada tiempo en afirmativa, negativa y
// pregunta, en bloques. Transcritas tal cual del sitio original
// (legacy/assets/js/tense-lab.js, «English Tenses Chart»): no reescribas los ejemplos.
//
// Bloques: s = sujeto (azul), a = auxiliar (ámbar), v = verbo (verde), o = complemento (gris).
// "swap" marca las preguntas: el auxiliar pasa delante del sujeto.
import type { TenseId } from "./tense-index";

export type BlockRole = "s" | "a" | "v" | "o";
export type Block = readonly [BlockRole, string];
export type MoodRow = { rule: readonly Block[]; ex: readonly Block[]; swap?: boolean };
export type TenseGroup = {
  id: string;
  label: string;
  note?: string; // en inglés, del original
  moods: { pos: MoodRow; neg: MoodRow; q: MoodRow };
};
export type TenseChart = { id: TenseId; groups: readonly TenseGroup[] };

export const tenseCharts: readonly TenseChart[] = [
  {
    id: "simple-present",
    groups: [
      {
        id: "plural",
        label: "I / You / We / They",
        moods: {
          pos: {
            rule: [
              ["s", "I / You / We / They"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "I"],
              ["v", "love"],
              ["o", "comics"],
            ],
          },
          neg: {
            rule: [
              ["s", "I / You / We / They"],
              ["a", "do not / don't"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "They"],
              ["a", "don't"],
              ["v", "love"],
              ["o", "comics"],
            ],
          },
          q: {
            rule: [
              ["a", "Do"],
              ["s", "I / You / We / They"],
              ["v", "verb"],
            ],
            swap: true,
            ex: [
              ["a", "Do"],
              ["s", "we"],
              ["v", "love"],
              ["o", "comics?"],
            ],
          },
        },
      },
      {
        id: "third",
        label: "He / She / It",
        moods: {
          pos: {
            rule: [
              ["s", "He / She / It"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "She"],
              ["v", "loves"],
              ["o", "comics"],
            ],
          },
          neg: {
            rule: [
              ["s", "He / She / It"],
              ["a", "does not / doesn't"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "He"],
              ["a", "doesn't"],
              ["v", "love"],
              ["o", "comics"],
            ],
          },
          q: {
            rule: [
              ["a", "Does"],
              ["s", "He / She / It"],
              ["v", "verb"],
            ],
            swap: true,
            ex: [
              ["a", "Does"],
              ["s", "it"],
              ["v", "love"],
              ["o", "comics?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "present-continuous",
    groups: [
      {
        id: "i",
        label: "I",
        moods: {
          pos: {
            rule: [
              ["s", "I"],
              ["a", "am"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "I"],
              ["a", "am"],
              ["v", "taking"],
              ["o", "pictures"],
            ],
          },
          neg: {
            rule: [
              ["s", "I"],
              ["a", "am not"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "I'm"],
              ["a", "not"],
              ["v", "taking"],
              ["o", "pictures"],
            ],
          },
          q: {
            rule: [
              ["a", "Am"],
              ["s", "I"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Am"],
              ["s", "I"],
              ["v", "taking"],
              ["o", "pictures?"],
            ],
          },
        },
      },
      {
        id: "plural",
        label: "You / We / They",
        moods: {
          pos: {
            rule: [
              ["s", "You / We / They"],
              ["a", "are"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "You're"],
              ["v", "taking"],
              ["o", "pictures"],
            ],
          },
          neg: {
            rule: [
              ["s", "You / We / They"],
              ["a", "are not / aren't"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "We"],
              ["a", "are not"],
              ["v", "taking"],
              ["o", "pictures"],
            ],
          },
          q: {
            rule: [
              ["a", "Are"],
              ["s", "You / We / They"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Are"],
              ["s", "they"],
              ["v", "taking"],
              ["o", "pictures?"],
            ],
          },
        },
      },
      {
        id: "third",
        label: "He / She / It",
        moods: {
          pos: {
            rule: [
              ["s", "He / She / It"],
              ["a", "is"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "He"],
              ["a", "is"],
              ["v", "taking"],
              ["o", "pictures"],
            ],
          },
          neg: {
            rule: [
              ["s", "He / She / It"],
              ["a", "is not / isn't"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "She"],
              ["a", "is not"],
              ["v", "taking"],
              ["o", "pictures"],
            ],
          },
          q: {
            rule: [
              ["a", "Is"],
              ["s", "He / She / It"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Is"],
              ["s", "she"],
              ["v", "taking"],
              ["o", "pictures?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "present-perfect",
    groups: [
      {
        id: "plural",
        label: "I / You / We / They",
        moods: {
          pos: {
            rule: [
              ["s", "I / You / We / They"],
              ["a", "have"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "I"],
              ["a", "have"],
              ["v", "fixed"],
              ["o", "the TV"],
            ],
          },
          neg: {
            rule: [
              ["s", "I / You / We / They"],
              ["a", "have not / haven't"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "They"],
              ["a", "haven't"],
              ["v", "fixed"],
              ["o", "the TV"],
            ],
          },
          q: {
            rule: [
              ["a", "Have"],
              ["s", "I / You / We / They"],
              ["v", "verb (past participle)"],
            ],
            swap: true,
            ex: [
              ["a", "Have"],
              ["s", "you"],
              ["v", "fixed"],
              ["o", "the TV?"],
            ],
          },
        },
      },
      {
        id: "third",
        label: "He / She / It",
        moods: {
          pos: {
            rule: [
              ["s", "He / She / It"],
              ["a", "has"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "She"],
              ["a", "has"],
              ["v", "fixed"],
              ["o", "the TV"],
            ],
          },
          neg: {
            rule: [
              ["s", "He / She / It"],
              ["a", "has not / hasn't"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "She"],
              ["a", "hasn't"],
              ["v", "fixed"],
              ["o", "the TV"],
            ],
          },
          q: {
            rule: [
              ["a", "Has"],
              ["s", "He / She / It"],
              ["v", "verb (past participle)"],
            ],
            swap: true,
            ex: [
              ["a", "Has"],
              ["s", "he"],
              ["v", "fixed"],
              ["o", "the TV?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "present-perfect-continuous",
    groups: [
      {
        id: "plural",
        label: "I / You / We / They",
        moods: {
          pos: {
            rule: [
              ["s", "I / You / We / They"],
              ["a", "have"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "I"],
              ["a", "have"],
              ["a", "been"],
              ["v", "playing"],
              ["o", "videogames"],
            ],
          },
          neg: {
            rule: [
              ["s", "I / You / We / They"],
              ["a", "have not / haven't"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "You"],
              ["a", "haven't"],
              ["a", "been"],
              ["v", "playing"],
              ["o", "videogames"],
            ],
          },
          q: {
            rule: [
              ["a", "Have"],
              ["s", "I / You / We / They"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Have"],
              ["s", "they"],
              ["a", "been"],
              ["v", "playing"],
              ["o", "videogames?"],
            ],
          },
        },
      },
      {
        id: "third",
        label: "He / She / It",
        moods: {
          pos: {
            rule: [
              ["s", "He / She / It"],
              ["a", "has"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "She"],
              ["a", "has"],
              ["a", "been"],
              ["v", "playing"],
              ["o", "videogames"],
            ],
          },
          neg: {
            rule: [
              ["s", "He / She / It"],
              ["a", "has not / hasn't"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "He's"],
              ["a", "not"],
              ["a", "been"],
              ["v", "playing"],
              ["o", "videogames"],
            ],
          },
          q: {
            rule: [
              ["a", "Has"],
              ["s", "He / She / It"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Has"],
              ["s", "he"],
              ["a", "been"],
              ["v", "playing"],
              ["o", "videogames?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "simple-past",
    groups: [
      {
        id: "all",
        label: "All subjects",
        note: "Same for all subjects: I, you, he, she, it, we, they",
        moods: {
          pos: {
            rule: [
              ["s", "Subject"],
              ["v", "verb (past simple)"],
            ],
            ex: [
              ["s", "We"],
              ["v", "closed"],
              ["o", "the window"],
            ],
          },
          neg: {
            rule: [
              ["s", "Subject"],
              ["a", "did not / didn't"],
              ["v", "verb (base form)"],
            ],
            ex: [
              ["s", "He"],
              ["a", "didn't"],
              ["v", "close"],
              ["o", "the window"],
            ],
          },
          q: {
            rule: [
              ["a", "Did"],
              ["s", "Subject"],
              ["v", "verb (base form)"],
            ],
            swap: true,
            ex: [
              ["a", "Did"],
              ["s", "you"],
              ["v", "close"],
              ["o", "the window?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "past-continuous",
    groups: [
      {
        id: "singular",
        label: "I / He / She / It",
        moods: {
          pos: {
            rule: [
              ["s", "I / He / She / It"],
              ["a", "was"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "He"],
              ["a", "was"],
              ["v", "studying"],
            ],
          },
          neg: {
            rule: [
              ["s", "I / He / She / It"],
              ["a", "was not / wasn't"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "I"],
              ["a", "was not"],
              ["v", "studying"],
            ],
          },
          q: {
            rule: [
              ["a", "Was"],
              ["s", "I / He / She / It"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Was"],
              ["s", "she"],
              ["v", "studying?"],
            ],
          },
        },
      },
      {
        id: "plural",
        label: "You / We / They",
        moods: {
          pos: {
            rule: [
              ["s", "You / We / They"],
              ["a", "were"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "We"],
              ["a", "were"],
              ["v", "studying"],
            ],
          },
          neg: {
            rule: [
              ["s", "You / We / They"],
              ["a", "were not / weren't"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "You"],
              ["a", "weren't"],
              ["v", "studying"],
            ],
          },
          q: {
            rule: [
              ["a", "Were"],
              ["s", "You / We / They"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Were"],
              ["s", "they"],
              ["v", "studying?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "past-perfect",
    groups: [
      {
        id: "all",
        label: "All subjects",
        note: "Same for all subjects: I, you, he, she, it, we, they",
        moods: {
          pos: {
            rule: [
              ["s", "Subject"],
              ["a", "had"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "She"],
              ["a", "had"],
              ["v", "gone out"],
            ],
          },
          neg: {
            rule: [
              ["s", "Subject"],
              ["a", "had not / hadn't"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "You"],
              ["a", "hadn't"],
              ["v", "gone out"],
            ],
          },
          q: {
            rule: [
              ["a", "Had"],
              ["s", "Subject"],
              ["v", "verb (past participle)"],
            ],
            swap: true,
            ex: [
              ["a", "Had"],
              ["s", "they"],
              ["v", "gone out?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "past-perfect-continuous",
    groups: [
      {
        id: "all",
        label: "All subjects",
        note: "Same for all subjects: I, you, he, she, it, we, they",
        moods: {
          pos: {
            rule: [
              ["s", "Subject"],
              ["a", "had"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "I"],
              ["a", "had"],
              ["a", "been"],
              ["v", "cycling"],
            ],
          },
          neg: {
            rule: [
              ["s", "Subject"],
              ["a", "had not / hadn't"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "We"],
              ["a", "had not"],
              ["a", "been"],
              ["v", "cycling"],
            ],
          },
          q: {
            rule: [
              ["a", "Had"],
              ["s", "Subject"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Had"],
              ["s", "she"],
              ["a", "been"],
              ["v", "cycling?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "future-simple-will",
    groups: [
      {
        id: "all",
        label: "All subjects",
        note: "Same for all subjects: I, you, he, she, it, we, they",
        moods: {
          pos: {
            rule: [
              ["s", "Subject"],
              ["a", "will"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "I"],
              ["a", "will"],
              ["v", "give"],
              ["o", "classes"],
            ],
          },
          neg: {
            rule: [
              ["s", "Subject"],
              ["a", "will not / won't"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "We"],
              ["a", "won't"],
              ["v", "give"],
              ["o", "classes"],
            ],
          },
          q: {
            rule: [
              ["a", "Will"],
              ["s", "Subject"],
              ["v", "verb"],
            ],
            swap: true,
            ex: [
              ["a", "Will"],
              ["s", "he"],
              ["v", "give"],
              ["o", "classes?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "future-simple-going-to",
    groups: [
      {
        id: "i",
        label: "I",
        moods: {
          pos: {
            rule: [
              ["s", "I"],
              ["a", "am"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "I'm"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza"],
            ],
          },
          neg: {
            rule: [
              ["s", "I"],
              ["a", "am not"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "I'm"],
              ["a", "not"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza"],
            ],
          },
          q: {
            rule: [
              ["a", "Am"],
              ["s", "I"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            swap: true,
            ex: [
              ["a", "Am"],
              ["s", "I"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza?"],
            ],
          },
        },
      },
      {
        id: "third",
        label: "He / She / It",
        moods: {
          pos: {
            rule: [
              ["s", "He / She / It"],
              ["a", "is"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "He"],
              ["a", "is"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza"],
            ],
          },
          neg: {
            rule: [
              ["s", "He / She / It"],
              ["a", "is not / isn't"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "She"],
              ["a", "is not"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza"],
            ],
          },
          q: {
            rule: [
              ["a", "Is"],
              ["s", "He / She / It"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            swap: true,
            ex: [
              ["a", "Is"],
              ["s", "he"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza?"],
            ],
          },
        },
      },
      {
        id: "plural",
        label: "You / We / They",
        moods: {
          pos: {
            rule: [
              ["s", "You / We / They"],
              ["a", "are"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "They're"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza"],
            ],
          },
          neg: {
            rule: [
              ["s", "You / We / They"],
              ["a", "are not / aren't"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            ex: [
              ["s", "We"],
              ["a", "are not"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza"],
            ],
          },
          q: {
            rule: [
              ["a", "Are"],
              ["s", "You / We / They"],
              ["a", "going to"],
              ["v", "verb"],
            ],
            swap: true,
            ex: [
              ["a", "Are"],
              ["s", "you"],
              ["a", "going to"],
              ["v", "order"],
              ["o", "pizza?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "future-continuous",
    groups: [
      {
        id: "all",
        label: "All subjects",
        note: "Same for all subjects: I, you, he, she, it, we, they",
        moods: {
          pos: {
            rule: [
              ["s", "Subject"],
              ["a", "will"],
              ["a", "be"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "She"],
              ["a", "will"],
              ["a", "be"],
              ["v", "singing"],
            ],
          },
          neg: {
            rule: [
              ["s", "Subject"],
              ["a", "will not / won't"],
              ["a", "be"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "I"],
              ["a", "won't"],
              ["a", "be"],
              ["v", "singing"],
            ],
          },
          q: {
            rule: [
              ["a", "Will"],
              ["s", "Subject"],
              ["a", "be"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Will"],
              ["s", "you"],
              ["a", "be"],
              ["v", "singing?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "future-perfect",
    groups: [
      {
        id: "all",
        label: "All subjects",
        note: "Same for all subjects: I, you, he, she, it, we, they",
        moods: {
          pos: {
            rule: [
              ["s", "Subject"],
              ["a", "will"],
              ["a", "have"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "You"],
              ["a", "will"],
              ["a", "have"],
              ["v", "finished"],
              ["o", "by tomorrow"],
            ],
          },
          neg: {
            rule: [
              ["s", "Subject"],
              ["a", "will not / won't"],
              ["a", "have"],
              ["v", "verb (past participle)"],
            ],
            ex: [
              ["s", "We"],
              ["a", "won't"],
              ["a", "have"],
              ["v", "finished"],
              ["o", "by tomorrow"],
            ],
          },
          q: {
            rule: [
              ["a", "Will"],
              ["s", "Subject"],
              ["a", "have"],
              ["v", "verb (past participle)"],
            ],
            swap: true,
            ex: [
              ["a", "Will"],
              ["s", "she"],
              ["a", "have"],
              ["v", "finished"],
              ["o", "by tomorrow?"],
            ],
          },
        },
      },
    ],
  },
  {
    id: "future-perfect-continuous",
    groups: [
      {
        id: "all",
        label: "All subjects",
        note: "Same for all subjects: I, you, he, she, it, we, they",
        moods: {
          pos: {
            rule: [
              ["s", "Subject"],
              ["a", "will"],
              ["a", "have"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "I"],
              ["a", "will"],
              ["a", "have"],
              ["a", "been"],
              ["v", "studying"],
              ["o", "English for 4 years before I get my certificate"],
            ],
          },
          neg: {
            rule: [
              ["s", "Subject"],
              ["a", "will not / won't"],
              ["a", "have"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            ex: [
              ["s", "He"],
              ["a", "won't"],
              ["a", "have"],
              ["a", "been"],
              ["v", "studying"],
              ["o", "English for 4 years before he gets his certificate"],
            ],
          },
          q: {
            rule: [
              ["a", "Will"],
              ["s", "Subject"],
              ["a", "have"],
              ["a", "been"],
              ["v", "verb (ing)"],
            ],
            swap: true,
            ex: [
              ["a", "Will"],
              ["s", "they"],
              ["a", "have"],
              ["a", "been"],
              ["v", "studying"],
              ["o", "English for 4 years before they get their certificate?"],
            ],
          },
        },
      },
    ],
  },
];

export function getTenseChart(id: string): TenseChart | undefined {
  return tenseCharts.find((t) => t.id === id);
}
