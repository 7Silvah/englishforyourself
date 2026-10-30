import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NotFound } from "@/components/layout/not-found";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// Archivo generado por el plugin de Vite a partir de src/routes/. No se edita a mano.
import { routeTree } from "./routeTree.gen";
import "./index.css";

const router = createRouter({
  routeTree,
  defaultPreload: "intent", // precarga la ruta al pasar el ratón por un enlace
  scrollRestoration: true,
  defaultNotFoundComponent: NotFound,
});

// Registra el router para que <Link to="…"> y los params tengan tipos.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el elemento #root en index.html");

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
