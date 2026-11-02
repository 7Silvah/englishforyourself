import type { Level } from "@/content/schema";
import { cn } from "@/lib/utils";

// Clases completas (Tailwind solo genera las que aparecen escritas tal cual)
const LEVEL_CLASSES: Record<Level, string> = {
  A1: "border-level-a1-border bg-level-a1 text-level-a1-fg",
  A2: "border-level-a2-border bg-level-a2 text-level-a2-fg",
  B1: "border-level-b1-border bg-level-b1 text-level-b1-fg",
  B2: "border-level-b2-border bg-level-b2 text-level-b2-fg",
  C1: "border-level-c1-border bg-level-c1 text-level-c1-fg",
};

// Nivel del MCER con su color; el texto («A1») siempre está, el color solo ayuda
export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-9 justify-center rounded-md border px-1.5 py-0.5 text-xs font-semibold",
        LEVEL_CLASSES[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
