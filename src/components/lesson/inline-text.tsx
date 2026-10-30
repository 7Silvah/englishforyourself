import { Fragment } from "react";
import type { Tone } from "@/content/schema";
import { cn } from "@/lib/utils";
import { toneSolid } from "./tones";

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\[[a-z]+:[^\]]+\]\])/g;

// Formato mínimo del texto de las tablas: **negrita**, *cursiva* y [[pos:texto]]
export function InlineText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("[[")) {
          const [tone, ...rest] = part.slice(2, -2).split(":");
          const cls = toneSolid[tone as Tone];
          return (
            <span key={i} className={cn("rounded px-1", cls)}>
              {rest.join(":")}
            </span>
          );
        }
        if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
