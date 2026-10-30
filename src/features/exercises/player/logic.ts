import { percent } from "@/features/progress/logic";
import type { CheckResult, ItemResponse, SupportedItem } from "../check";

export type Mode = "practice" | "exam";

/** Un ítem ya respondido y corregido */
export type ItemRecord = { item: SupportedItem; response: ItemResponse; result: CheckResult };

/**
 * "Casi" (una falta de ortografía) solo da otra oportunidad una vez y solo en práctica.
 * En examen, o si se repite, cuenta como fallo.
 */
export function finalResult(
  result: CheckResult,
  { mode, retried }: { mode: Mode; retried: boolean },
): CheckResult {
  if (result.status !== "almost" || (mode === "practice" && !retried)) return result;
  return {
    status: "wrong",
    parts: result.parts?.map((p) => (p === "almost" ? "wrong" : p)),
  };
}

export function summarize(records: readonly ItemRecord[]) {
  const failed = records.filter((r) => r.result.status !== "correct");
  const correct = records.length - failed.length;
  return { correct, total: records.length, percent: percent(correct, records.length), failed };
}
