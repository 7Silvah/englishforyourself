import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnglishVoice } from "@/hooks/use-english-voice";
import { es } from "@/i18n/es";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

// Tamaño del círculo: sm en listas densas, md en filas y tablas, lg en tarjetas grandes
const SIZES = {
  sm: "size-7 [&_svg]:size-3.5",
  md: "size-8 [&_svg]:size-4",
  lg: "size-11 [&_svg]:size-5",
} as const;

// Botón 🔊 que lee un texto en inglés: un círculo con el icono de audio, igual en toda la
// app (regla de U2, ver /dev/ui). Si no hay voces en inglés, no se muestra.
// "text" puede ser una función: se llama al pulsar (útil para leer el contenido
// ya renderizado de un elemento, como una frase de <Examples>).
export function SpeakButton({
  text,
  label = es.exercises.player.listen,
  size = "md",
  className,
}: {
  text: string | (() => string);
  label?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const available = useEnglishVoice();
  if (!available) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      title={label}
      className={cn(
        // Primario suave y no bg-muted: el círculo se ve también sobre fondos grises
        // (los recuadros de ejemplos de las lecciones son bg-muted)
        "shrink-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary print:hidden",
        SIZES[size],
        className,
      )}
      onClick={() => speak(typeof text === "function" ? text() : text)}
    >
      <Volume2 aria-hidden />
    </Button>
  );
}
