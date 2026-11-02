// Palabras favoritas (⭐) de la tabla de Vocabulario, guardadas en el navegador (F17c V6).
// Se guardan por id de fila (VocabularyEntry.id: "apple|noun", "t:hedgehog").
import { create } from "zustand";
import { persist } from "zustand/middleware";

type VocabularyStore = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
};

export const useVocabularyStore = create<VocabularyStore>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
    }),
    { name: "efy-vocabulary", version: 1, partialize: ({ favorites }) => ({ favorites }) },
  ),
);
