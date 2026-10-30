import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import { es } from "@/i18n/es";
import { Callout } from "./callout";

/** Truco para recordar una regla */
export function Tip({ title = es.lesson.tip, children }: { title?: string; children: ReactNode }) {
  return (
    <Callout
      Icon={Lightbulb}
      title={title}
      className="border-almost-border bg-almost text-foreground"
    >
      {children}
    </Callout>
  );
}
