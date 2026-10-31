import { describe, expect, it } from "vitest";
import { ExerciseSet } from "../schema";
import { collocationRest, generateCollocationSet, type CollocationLists } from "./collocations";

const lists: CollocationLists = {
  make: [
    "Make a decision",
    "Make a mistake",
    "Make a noise",
    "Make friends",
    "Make an effort",
    "Make progress",
    "Make a speech",
    "Make sure",
    "Make a fuss",
    "Make room",
    "Make the bed",
    "Make a call",
  ],
  do: ["Do homework", "Do the dishes", "Do sport", "Do research", "Do the shopping", "Do harm"],
  have: ["Have a shower", "Have lunch", "Have fun", "Have a party"],
  take: ["Take a shower", "Take a seat", "Take a photo", "Take a call"],
};

describe("collocationRest", () => {
  it("quita el verbo sin distinguir mayúsculas", () => {
    expect(collocationRest("Make a decision", "make")).toBe("a decision");
    expect(collocationRest("Do homework", "make")).toBeUndefined();
  });
});

describe("generateCollocationSet", () => {
  it("genera un set válido con opción múltiple y clasificar", () => {
    const set = generateCollocationSet("Collocations with Make", "B1", "make", lists, "s");
    expect(ExerciseSet.safeParse(set).success).toBe(true);
    expect(set.items.filter((i) => i.type === "multiple-choice")).toHaveLength(7);
    expect(set.items.some((i) => i.type === "categorize")).toBe(true);
  });

  it("ninguna opción incorrecta es una combinación correcta", () => {
    for (const seed of ["a", "b", "c", "d"])
      for (const item of generateCollocationSet("L", "B1", "take", lists, seed).items) {
        if (item.type !== "multiple-choice") continue;
        expect(item.options[0]).toBe("take");
        const rest = item.prompt.replace("___ ", "");
        // "a shower" y "a call" valen con have/make: no pueden salir como opción incorrecta
        if (rest === "a shower") expect(item.options).not.toContain("have");
        if (rest === "a call") expect(item.options).not.toContain("make");
        // "a seat" vale también con have (ALSO_VALID)
        if (rest === "a seat") expect(item.options).not.toContain("have");
      }
  });

  it("la misma semilla da el mismo set", () => {
    expect(generateCollocationSet("L", "B1", "do", lists, "z")).toEqual(
      generateCollocationSet("L", "B1", "do", lists, "z"),
    );
  });
});
