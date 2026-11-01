import { es } from "@/i18n/es";

// Aviso de falso amigo: texto además del color (no solo el color)
export function FalseFriendBadge({ word }: { word: string }) {
  return (
    <span
      lang="es"
      className="rounded bg-neg-soft px-1.5 py-0.5 text-xs font-normal text-foreground"
    >
      {es.lesson.falseFriendBadge(word)}
    </span>
  );
}
