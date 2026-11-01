import { cn } from "@/lib/utils";
import { blockClasses, type BlockKind } from "./tones";

const roles = blockClasses;
type Role = BlockKind;

function isRole(value: string): value is Role {
  return value in roles;
}

// "subj:Sujeto" → { role: "subj", text: "Sujeto" }. Sin prefijo conocido, es texto suelto ("+", "?").
function parse(part: string): { role?: Role; text: string } {
  const [prefix = "", ...rest] = part.split(":");
  return isRole(prefix) && rest.length > 0
    ? { role: prefix, text: rest.join(":") }
    : { text: part };
}

/**
 * Fórmula de una estructura: cada palabra del ejemplo en una ficha de color y, debajo,
 * el papel que cumple:
 *   <Formula parts={["subj:Sujeto", "verb:verbo", "obj:complemento"]}
 *            example={["She", "works", "here."]} />
 * El color nunca va solo: cada ficha lleva su papel escrito. Sin ejemplo, la ficha
 * muestra el papel.
 */
export function Formula({ parts, example }: { parts: string[]; example?: string[] }) {
  return (
    <figure className="my-6 overflow-x-auto rounded-xl border bg-card p-4">
      <div className="flex w-max items-start gap-2">
        {parts.map((part, i) => {
          const { role, text } = parse(part);
          if (!role)
            return (
              <span key={i} className="py-1.5 text-muted-foreground">
                {example?.[i] ?? text}
              </span>
            );
          const word = example?.[i];
          return (
            <div key={i} className="flex items-start gap-2">
              {i > 0 && (
                <span aria-hidden className="py-1.5 text-muted-foreground">
                  +
                </span>
              )}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  lang={word ? "en" : undefined}
                  className={cn("rounded-full border px-3.5 py-1.5 font-medium", roles[role])}
                >
                  {word ?? text}
                </span>
                {word && <span className="text-xs font-medium text-muted-foreground">{text}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
