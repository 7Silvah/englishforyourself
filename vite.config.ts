import { fileURLToPath, URL } from "node:url";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vite";
import { contentMeta } from "./scripts/vite-plugin-content-meta.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Tiene que ir antes de react(): genera src/routeTree.gen.ts desde src/routes/
    // y separa cada ruta en su propio archivo JS (code splitting).
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    // "x.mdx?meta" / "x.json?meta" → solo metadatos (ver el archivo del plugin)
    contentMeta(),
    // .mdx → componente React. remark-frontmatter evita que el YAML se vea como texto;
    // rehype-slug pone id a los títulos (para enlazarlos y para el índice lateral).
    {
      enforce: "pre",
      ...mdx({ remarkPlugins: [remarkFrontmatter, remarkGfm], rehypePlugins: [rehypeSlug] }),
    },
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
