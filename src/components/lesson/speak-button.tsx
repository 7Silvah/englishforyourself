import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { canSpeak, speak } from "@/lib/speak";

// Botón 🔊 que lee una frase en inglés. Si el navegador no puede hablar, no se muestra.
export function SpeakButton({
  text,
  label = es.exercises.player.listen,
}: {
  text: string;
  label?: string;
}) {
  if (!canSpeak()) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => speak(text)}
    >
      <Volume2 aria-hidden />
    </Button>
  );
}
