import { es } from "@/i18n/es";

// Título de la pestaña del navegador: "Curso · English for Yourself"
export function pageTitle(title?: string): string {
  return title ? `${title} · ${es.app.name}` : es.app.name;
}
