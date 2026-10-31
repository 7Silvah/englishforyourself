// Caja de Leitner de cada palabra, guardada en el navegador (como el progreso).
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dayKey } from "@/features/progress/logic";
import { review, type CardState } from "./logic";

type FlashcardStore = {
  cards: Record<string, CardState>; // por cardKey(): "seccion/slug#palabra"
  answer: (key: string, knew: boolean) => void;
  reset: () => void;
};

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set) => ({
      cards: {},
      answer: (key, knew) =>
        set((state) => ({
          cards: { ...state.cards, [key]: review(state.cards[key], knew, dayKey(new Date())) },
        })),
      reset: () => set({ cards: {} }),
    }),
    { name: "efy-flashcards", version: 1, partialize: ({ cards }) => ({ cards }) },
  ),
);
