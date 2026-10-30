import { Languages } from "lucide-react";
import type { ReactNode } from "react";
import { es } from "@/i18n/es";
import { Callout } from "./callout";

/** Cómo se dice o se piensa en español, frente al inglés. Título por defecto: "En español". */
export function Explain({
  title = es.lesson.spanish,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Callout Icon={Languages} title={title} className="border-primary/30 bg-primary/5">
      {children}
    </Callout>
  );
}
