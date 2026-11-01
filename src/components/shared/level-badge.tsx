import type { Level } from "@/content/schema";
import { cn } from "@/lib/utils";
import { LEVEL_TONE } from "./level-styles";

// Nivel del MCER con su color (regla de U2, ver /dev/ui); el texto («A1») siempre está,
// el color solo ayuda a reconocerlo de un vistazo
export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-9 justify-center rounded-md border px-1.5 py-0.5 text-xs font-semibold",
        LEVEL_TONE[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
