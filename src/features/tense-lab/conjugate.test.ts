import { describe, expect, it } from "vitest";
import {
  answerVariants,
  conjugate,
  firstAuxiliaries,
  ingForm,
  pastForm,
  participleForm,
  PRACTICE_VERBS,
  regularPast,
  sentenceOf,
  thirdPerson,
  type Mood,
  type PracticeVerb,
  type Subject,
} from "./conjugate";

const play: PracticeVerb = { base: "play", object: "tennis", es: "" };
const write: PracticeVerb = { base: "write", object: "an email", es: "" };
const swim: PracticeVerb = { base: "swim", object: "in the sea", es: "" };

const say = (
  tense: Parameters<typeof conjugate>[0],
  mood: Mood,
  subject: Subject,
  verb: PracticeVerb,
) => sentenceOf(conjugate(tense, mood, subject, verb), mood);

describe("formas del verbo", () => {
  it.each([
    ["play", "plays", "playing", "played"],
    ["study", "studies", "studying", "studied"],
    ["watch", "watches", "watching", "watched"],
    ["go", "goes", "going", "went"],
    ["make", "makes", "making", "made"],
    ["swim", "swims", "swimming", "swam"],
    ["stop", "stops", "stopping", "stopped"],
    ["visit", "visits", "visiting", "visited"],
    ["lie", "lies", "lying", "lied"],
    ["see", "sees", "seeing", "saw"],
  ])("%s → %s, %s, %s", (base, s, ing, past) => {
    expect(thirdPerson(base)).toBe(s);
    expect(ingForm(base)).toBe(ing);
    expect(pastForm(base)).toBe(past);
  });

  it("participio irregular y pasado regularizado (para distractores)", () => {
    expect(participleForm("write")).toBe("written");
    expect(participleForm("cook")).toBe("cooked");
    expect(regularPast("buy")).toBe("buyed");
    expect(regularPast("put")).toBe("putted");
  });
});

describe("conjugate", () => {
  it("presente simple: -s con he/she y do/does en negativa y pregunta", () => {
    expect(say("simple-present", "pos", "she", play)).toBe("She plays tennis.");
    expect(say("simple-present", "neg", "she", play)).toBe("She does not play tennis.");
    expect(say("simple-present", "q", "they", play)).toBe("Do they play tennis?");
  });

  it("pasado simple: pasado en afirmativa, did + forma base en lo demás", () => {
    expect(say("simple-past", "pos", "I", write)).toBe("I wrote an email.");
    expect(say("simple-past", "neg", "we", write)).toBe("We did not write an email.");
    expect(say("simple-past", "q", "he", write)).toBe("Did he write an email?");
  });

  it("tiempos con auxiliar: el primero depende del sujeto y es el que se niega o se adelanta", () => {
    expect(say("present-continuous", "pos", "I", swim)).toBe("I am swimming in the sea.");
    expect(say("present-continuous", "q", "she", swim)).toBe("Is she swimming in the sea?");
    expect(say("present-perfect", "neg", "he", write)).toBe("He has not written an email.");
    expect(say("past-continuous", "pos", "they", play)).toBe("They were playing tennis.");
    expect(say("future-simple-going-to", "q", "you", play)).toBe("Are you going to play tennis?");
    expect(say("future-perfect-continuous", "neg", "we", play)).toBe(
      "We will not have been playing tennis.",
    );
  });

  it("marca el papel de cada bloque", () => {
    expect(conjugate("present-perfect-continuous", "q", "she", play).map((p) => p.role)).toEqual([
      "aux",
      "subj",
      "aux",
      "verb",
      "obj",
    ]);
  });

  it("todos los tiempos y verbos de práctica dan una frase", () => {
    for (const verb of PRACTICE_VERBS)
      expect(say("past-perfect", "pos", "you", verb)).toMatch(/^You had \w+ /);
  });
});

describe("ayudas para los ejercicios", () => {
  it("firstAuxiliaries lista los auxiliares posibles del tiempo", () => {
    expect(firstAuxiliaries("present-continuous")).toEqual(["am", "are", "is"]);
    expect(firstAuxiliaries("simple-present")).toEqual(["do", "does"]);
    expect(firstAuxiliaries("future-simple-will")).toEqual(["will"]);
  });

  it("answerVariants añade las contracciones ambiguas", () => {
    expect(answerVariants("She is playing tennis.")).toEqual([
      "She is playing tennis.",
      "She's playing tennis.",
    ]);
    expect(answerVariants("They had gone to the gym.")).toEqual([
      "They had gone to the gym.",
      "They'd gone to the gym.",
    ]);
    expect(answerVariants("Do they play tennis?")).toEqual(["Do they play tennis?"]);
  });
});
