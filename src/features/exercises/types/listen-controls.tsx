import { Snail, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { SLOW_RATE, speak } from "@/lib/speech";

const t = es.exercises.types.listen;

// "Escuchar" y "Más despacio". No se reproduce solo al aparecer: los navegadores
// bloquean el audio que no empieza con un gesto de la persona (un clic o una tecla).
export function ListenControls({ text }: { text: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="lg" onClick={() => speak(text)}>
        <Volume2 data-icon="inline-start" aria-hidden />
        {t.play}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={() => speak(text, { rate: SLOW_RATE })}
      >
        <Snail data-icon="inline-start" aria-hidden />
        {t.slow}
      </Button>
    </div>
  );
}
