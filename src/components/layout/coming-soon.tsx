import { Construction } from "lucide-react";
import { es } from "@/i18n/es";

// Marcador para las páginas que todavía no tienen contenido. Indica en qué fase llegan.
export function ComingSoon({ phase }: { phase: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed p-6 text-muted-foreground">
      <Construction className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{es.placeholder.comingSoon}</p>
        <p className="text-sm">{es.placeholder.phase(phase)}</p>
      </div>
    </div>
  );
}
