import type { Level } from "@/content/schema";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { LevelBadge } from "./level-badge";

// Un nivel con su nombre: «[B1] Intermedio I», con un inicio de frase opcional («Estás en
// el nivel [B1] Intermedio I»). Para títulos de bloque y avisos (regla de U2, ver /dev/ui).
export function LevelHeading({
  level,
  prefix,
  className,
}: {
  level: Level;
  prefix?: string;
  className?: string;
}) {
  return (
    // Los espacios {" "} no se ven (flex los ignora; separa el gap), pero hacen que el texto
    // se lea «Estás en el nivel B1 Intermedio I» y no «nivelB1Intermedio» en un lector de pantalla
    <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {prefix && <span>{prefix}</span>} <LevelBadge level={level} />{" "}
      <span>{es.course.levels[level].name}</span>
    </span>
  );
}
