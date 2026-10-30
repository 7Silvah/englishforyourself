import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { statusClasses } from "./item-props";

// Una opción de respuesta como tarjeta: toda la tarjeta es la etiqueta del radio.
// Tras corregir: la opción correcta en verde y la elegida (si falló) en rojo.
export function ChoiceOption({
  value,
  children,
  state,
  lang,
}: {
  value: unknown;
  children: ReactNode;
  state: "correct" | "wrong" | null;
  lang?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-base transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-disabled:cursor-default",
        state && statusClasses[state],
      )}
    >
      <RadioGroupItem value={value} />
      <span lang={lang} className="flex-1">
        {children}
      </span>
      {state === "correct" && <Check className="size-5" aria-hidden />}
      {state === "wrong" && <X className="size-5" aria-hidden />}
    </label>
  );
}
