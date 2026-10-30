import { Shuffle } from "lucide-react";
import type { ReactNode } from "react";
import { es } from "@/i18n/es";
import { Callout } from "./callout";

/**
 * Palabra que parece española pero significa otra cosa:
 *   <FalseFriend en="actually" notEs="actualmente" es="en realidad" />
 */
export function FalseFriend({
  en,
  notEs,
  es: meaning,
  children,
}: {
  en: string;
  notEs: string;
  es: string;
  children?: ReactNode;
}) {
  return (
    <Callout Icon={Shuffle} title={es.lesson.falseFriend} className="border-neg/50 bg-neg-soft">
      <p>
        <strong lang="en">{en}</strong> {es.lesson.notMeans} <s>{notEs}</s>: {es.lesson.means}{" "}
        <strong>{meaning}</strong>.
      </p>
      {children}
    </Callout>
  );
}
