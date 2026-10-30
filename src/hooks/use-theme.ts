import { createContext, useContext } from "react";

export type Theme = "light" | "dark" | "system";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Vive aparte del ThemeProvider para que ese archivo solo exporte componentes (fast refresh).
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return context;
}
