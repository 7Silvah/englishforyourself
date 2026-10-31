import { describe, expect, it } from "vitest";
import {
  buildSession,
  cardKey,
  deckStats,
  MAX_BOX,
  NEW_PER_SESSION,
  review,
  seenStats,
  type Card,
  type CardState,
} from "./logic";

const today = "2026-10-30";

describe("review (Leitner)", () => {
  it("una tarjeta nueva que ya sabes empieza en la caja 2 y vuelve mañana", () => {
    expect(review(undefined, true, today)).toEqual({ box: 2, due: "2026-10-31" });
  });

  it("una tarjeta nueva que no sabes empieza en la caja 1 y vuelve hoy", () => {
    expect(review(undefined, false, today)).toEqual({ box: 1, due: today });
  });

  it("saberla sube de caja y espera más: 1, 3, 7 y 14 días", () => {
    expect(review({ box: 1, due: today }, true, today)).toEqual({ box: 2, due: "2026-10-31" });
    expect(review({ box: 2, due: today }, true, today)).toEqual({ box: 3, due: "2026-11-02" });
    expect(review({ box: 3, due: today }, true, today)).toEqual({ box: 4, due: "2026-11-06" });
    expect(review({ box: 4, due: today }, true, today)).toEqual({ box: 5, due: "2026-11-13" });
  });

  it("la caja 5 es la última", () => {
    expect(review({ box: MAX_BOX, due: today }, true, today).box).toBe(MAX_BOX);
  });

  it("no saberla la devuelve a la caja 1 para hoy", () => {
    expect(review({ box: 4, due: today }, false, today)).toEqual({ box: 1, due: today });
  });
});

describe("buildSession", () => {
  const cards: Card[] = Array.from({ length: 30 }, (_, i) => ({
    key: cardKey("vocabulary/animals", `w${i}`),
    en: `w${i}`,
    es: `p${i}`,
  }));

  it("sin historial, solo entran las nuevas permitidas por sesión", () => {
    expect(buildSession(cards, {}, today, "s")).toHaveLength(NEW_PER_SESSION);
  });

  it("primero las que tocan hoy y después nuevas; las futuras no entran", () => {
    const states: Record<string, CardState> = {
      [cards[0]?.key ?? ""]: { box: 3, due: "2026-10-29" },
      [cards[1]?.key ?? ""]: { box: 1, due: today },
      [cards[2]?.key ?? ""]: { box: 2, due: "2026-11-05" },
    };
    const session = buildSession(cards, states, today, "s");
    expect(
      session
        .slice(0, 2)
        .map((c) => c.en)
        .sort(),
    ).toEqual(["w0", "w1"]);
    expect(session.map((c) => c.en)).not.toContain("w2");
    expect(session).toHaveLength(2 + NEW_PER_SESSION);
  });

  it("la misma semilla da la misma sesión", () => {
    expect(buildSession(cards, {}, today, "x")).toEqual(buildSession(cards, {}, today, "x"));
  });
});

describe("estadísticas", () => {
  const states: Record<string, CardState> = {
    "a#one": { box: 5, due: "2026-11-30" },
    "a#two": { box: 1, due: today },
    "b#three": { box: 1, due: today },
  };

  it("deckStats cuenta las de hoy, las nuevas y las dominadas", () => {
    expect(deckStats(["a#one", "a#two", "a#four"], states, today)).toEqual({
      due: 1,
      fresh: 1,
      mastered: 1,
    });
  });

  it("seenStats no necesita las palabras: solo el total de la lista", () => {
    expect(seenStats("a", 5, states, today)).toEqual({ due: 1, fresh: 3, mastered: 1 });
  });
});
