// Ejercicios generados de verbos irregulares: completar tablas de pasado y participio,
// y elegir la forma correcta frente a errores típicos ("buyed", "goed").
import { irregularVerbs, type IrregularVerb } from "@/content/data/irregular-verbs";
import { regularPast } from "@/features/tense-lab/conjugate";
import { es } from "@/i18n/es";
import { seededShuffle } from "@/lib/random";
import type { ExerciseItem, ExerciseSet } from "../schema";

const t = es.generated.irregular;

const first = (forms: readonly string[]) => forms[0] ?? "";

export function generateIrregularSet(seed: string): ExerciseSet {
  // "be" tiene dos pasados (was/were): en una tabla queda confuso, mejor fuera
  const verbs = seededShuffle(
    irregularVerbs.filter((v) => v.base !== "be"),
    `irregular:${seed}`,
  );
  const take = (from: number, n: number) => verbs.slice(from, from + n);

  const table = (id: string, rows: readonly IrregularVerb[]): ExerciseItem => ({
    id,
    type: "table-fill",
    columns: [t.past, t.participle],
    rows: rows.map((v) => ({
      header: `${v.base} (${v.es})`,
      cells: [{ answers: [...v.past] }, { answers: [...v.participle] }],
    })),
    explanationEs: t.explainTable,
  });

  // Opción múltiple: la forma correcta, la "regularizada" (error típico) y la de otro verbo
  const choice = (
    id: string,
    v: IrregularVerb,
    other: IrregularVerb,
    kind: "past" | "participle",
  ): ExerciseItem => {
    const valid = kind === "past" ? v.past : v.participle;
    const correct = first(valid);
    // Ningún distractor puede ser una forma válida ("learned" es tan correcto como "learnt")
    const candidates = [
      regularPast(v.base),
      first(kind === "past" ? v.participle : v.past),
      first(other.past),
      first(other.participle),
    ];
    const distractors = [...new Set(candidates)].filter((o) => !valid.includes(o)).slice(0, 2);
    const options = [correct, ...distractors];
    return {
      id,
      type: "multiple-choice",
      prompt: kind === "past" ? t.pastOf(v.base) : t.participleOf(v.base),
      options,
      answer: 0, // el player baraja las opciones
      explanationEs:
        kind === "past" ? t.explainPast(v.base, correct) : t.explainParticiple(v.base, correct),
    };
  };

  const pickVerb = (i: number) => verbs[i] ?? verbs[0];
  const items: ExerciseItem[] = [table("1", take(0, 4))];
  for (let i = 0; i < 4; i++) {
    const v = pickVerb(4 + i);
    const other = pickVerb(12 + i);
    if (v && other)
      items.push(choice(String(i + 2), v, other, i % 2 === 0 ? "past" : "participle"));
  }
  items.push(table("6", take(8, 4)));

  return {
    title: "Irregular verbs: generated practice",
    titleEs: es.generated.title(t.title),
    instructionEs: t.instruction,
    source: "generated",
    level: "A2",
    topics: ["irregular-verbs"],
    items,
  };
}
