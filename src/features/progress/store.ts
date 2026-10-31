// Progreso del estudiante, guardado en localStorage con el middleware "persist" de Zustand.
// Zustand en vez de useState porque estos datos se leen desde varias páginas
// (catálogo, resultado, /progreso) y deben sobrevivir a recargas.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyResults,
  applyReview,
  initialProgress,
  migrateProgress,
  type ItemOutcome,
  type ProgressData,
  type ReviewOutcome,
} from "./logic";

type ProgressStore = ProgressData & {
  recordResults: (setId: string, outcomes: readonly ItemOutcome[], complete: boolean) => void;
  recordReview: (outcomes: readonly ReviewOutcome[]) => void;
  reset: () => void;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      ...initialProgress,
      recordResults: (setId, outcomes, complete) =>
        set((state) => applyResults(state, setId, outcomes, { complete, now: new Date() })),
      recordReview: (outcomes) => set((state) => applyReview(state, outcomes, new Date())),
      reset: () => set(initialProgress),
    }),
    {
      name: "efy-progress",
      // Si cambia la forma de los datos, sube "version" y adapta migrateProgress
      // para convertir lo que ya tienen guardado los estudiantes.
      // v2 (F12): los errores guardan los días en que se acertaron (rightDays).
      version: 2,
      migrate: migrateProgress,
      partialize: ({ attempts, mistakes, streak, lastSetId }) => ({
        attempts,
        mistakes,
        streak,
        lastSetId,
      }),
    },
  ),
);
