// Ajustes del estudiante que valen en toda la app y sobreviven a recargar la página.
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsStore = {
  showTranslations: boolean; // ocultarlas sirve para ponerse a prueba con las listas
  setShowTranslations: (show: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      showTranslations: true,
      setShowTranslations: (showTranslations) => set({ showTranslations }),
    }),
    {
      name: "efy-settings",
      version: 1,
      partialize: ({ showTranslations }) => ({ showTranslations }),
    },
  ),
);
