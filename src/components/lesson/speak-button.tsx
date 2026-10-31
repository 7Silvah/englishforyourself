import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnglishVoice } from "@/hooks/use-english-voice";
import { es } from "@/i18n/es";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

// Botón 🔊 que lee un texto en inglés. Si no hay voces en inglés, no se muestra.
// "text" puede ser una función: se llama al pulsar (útil para leer el contenido
// ya renderizado de un elemento, como una frase de <Examples>).
export function SpeakButton({
  text,
  label = es.exercises.player.listen,
  className,
}: {
  text: string | (() => string);
  label?: string;
  className?: string;
}) {
  const available = useEnglishVoice();
  if (!available) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className={cn("print:hidden", className)}
      onClick={() => speak(typeof text === "function" ? text() : text)}
    >
      <Volume2 aria-hidden />
    </Button>
  );
}
