import { ArrowLeftRight } from "lucide-react";
import { blockClasses } from "@/components/lesson/tones";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import type { Piece } from "./conjugate";

// Frase en bloques de color. Cada bloque lleva su papel (sujeto, auxiliar…) para
// los lectores de pantalla: el color nunca es la única pista.
export function SentenceBlocks({
  pieces,
  swap = false,
  className,
}: {
  pieces: readonly Piece[];
  swap?: boolean; // pregunta: el auxiliar pasa delante del sujeto
  className?: string;
}) {
  return (
    <div lang="en" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {pieces.map((piece, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span
            className={cn("rounded-md border px-2.5 py-1 font-medium", blockClasses[piece.role])}
          >
            <span className="sr-only">{es.tenseLab.roles[piece.role]}: </span>
            {piece.text}
          </span>
          {swap && i === 0 && (
            <span title={es.tenseLab.swap} className="text-muted-foreground">
              <ArrowLeftRight className="size-4" aria-hidden />
              <span className="sr-only">{es.tenseLab.swap}</span>
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
