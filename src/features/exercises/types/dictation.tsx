import { Input } from "@/components/ui/input";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { statusClasses, type ItemProps } from "./item-props";
import { ListenControls } from "./listen-controls";

const t = es.exercises.types.dictation;

// Dictado: escuchar la frase (voz del navegador) y escribirla
export function Dictation({ item, response, onChange, result, locked }: ItemProps<"dictation">) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <ListenControls text={item.text} />
      <Input
        value={response.text}
        onChange={(e) => onChange({ ...response, text: e.target.value })}
        readOnly={locked}
        lang="en"
        aria-label={t.input}
        placeholder={t.input}
        aria-invalid={result?.status === "wrong" || undefined}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn("h-10 text-lg md:text-lg", result && statusClasses[result.status])}
      />
    </div>
  );
}
