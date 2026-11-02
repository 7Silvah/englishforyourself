import { Snail, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { SLOW_RATE, speak } from "@/lib/speech";

const t = es.exercises.types.listen;

// "Escuchar" y "Más despacio". No se reproduce solo al aparecer: los navegadores
// bloquean el audio que no empieza con un gesto de la persona (un clic o una tecla).
// Llevan texto porque son la acción principal del ejercicio, pero el icono va en un
// círculo, como el 🔊 del resto de la app (U2).
export function ListenControls({ text }: { text: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="lg" className="rounded-full pl-1.5" onClick={() => speak(text)}>
        <span className="grid size-7 place-items-center rounded-full bg-primary-foreground/20">
          <Volume2 aria-hidden />
        </span>
        {t.play}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="rounded-full pl-1.5"
        onClick={() => speak(text, { rate: SLOW_RATE })}
      >
        <span className="grid size-7 place-items-center rounded-full bg-muted text-primary">
          <Snail aria-hidden />
        </span>
        {t.slow}
      </Button>
    </div>
  );
}
