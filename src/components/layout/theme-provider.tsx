import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "@/hooks/use-theme";

// Debe coincidir con la clave del script de index.html que evita el parpadeo inicial.
const STORAGE_KEY = "efy-theme";

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // localStorage puede no estar disponible (modo privado estricto)
  }
  return "system";
}

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  // Sincroniza la clase .dark de <html> con el tema elegido.
  // Con "system" también escucha si el usuario cambia el tema del sistema operativo.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const isDark = theme === "dark" || (theme === "system" && darkQuery().matches);
      root.classList.toggle("dark", isDark);
      root.style.colorScheme = isDark ? "dark" : "light";
    };

    apply();
    if (theme !== "system") return;
    const query = darkQuery();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = (next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sin persistencia el tema sigue funcionando durante la sesión
    }
    setThemeState(next);
  };

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}
