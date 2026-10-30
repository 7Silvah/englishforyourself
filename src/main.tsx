import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el elemento #root en index.html");

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
