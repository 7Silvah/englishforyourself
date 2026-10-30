import { Circle, CircleCheck, CircleDot, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import type { UnitStatus } from "./logic";

const icons = { new: Circle, started: CircleDot, completed: CircleCheck, mastered: Trophy };

// Estado de una unidad: icono + texto (el color nunca va solo)
export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const Icon = icons[status];
  return (
    <Badge
      variant="outline"
      className={cn(status === "mastered" && "border-correct-border bg-correct text-correct-fg")}
    >
      <Icon data-icon="inline-start" aria-hidden />
      {es.course.status[status]}
    </Badge>
  );
}
