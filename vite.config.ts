import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Tiene que ir antes de react(): genera src/routeTree.gen.ts desde src/routes/
    // y separa cada ruta en su propio archivo JS (code splitting).
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Debe coincidir con "paths" de tsconfig.app.json
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
