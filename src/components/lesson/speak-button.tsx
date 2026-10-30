import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnglishVoice } from "@/hooks/use-english-voice";
import { es } from "@/i18n/es";
import { speak } from "@/lib/speech";

// Botón 🔊 que lee una frase en inglés. Si no hay voces en inglés, no se muestra.
export function SpeakButton({
  text,
  label = es.exercises.player.listen,
}: {
  text: string;
  label?: string;
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
      onClick={() => speak(text)}
    >
      <Volume2 aria-hidden />
    </Button>
  );
}
