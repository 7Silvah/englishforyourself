import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Caja base de Explain, Tip, CommonMistake y FalseFriend. <aside>: contenido complementario.
export function Callout({
  Icon,
  title,
  className,
  children,
}: {
  Icon: LucideIcon;
  title: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <aside className={cn("my-6 rounded-lg border p-4 [&_p]:my-1.5", className)}>
      <p className="flex items-center gap-2 font-semibold">
        <Icon className="size-5 shrink-0" aria-hidden />
        {title}
      </p>
      {children}
    </aside>
  );
}
