// Se ejecuta antes de cada archivo de test (vitest.config.ts → setupFiles)
import "@testing-library/jest-dom/vitest"; // añade expect(...).toBeInTheDocument() y similares
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom no implementa scrollTo y el router lo llama al navegar
window.scrollTo = () => {};

// Sin "globals" de Vitest, Testing Library no limpia solo el DOM entre tests
afterEach(() => {
  cleanup();
  localStorage.clear();
});
