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
 * Fórmula de una estructura en bloques de colores, con un ejemplo alineado debajo:
 *   <Formula parts={["subj:Sujeto", "verb:verbo", "obj:complemento"]}
 *            example={["She", "works", "here."]} />
 * El color nunca va solo: cada bloque lleva su nombre escrito.
 */
export function Formula({ parts, example }: { parts: string[]; example?: string[] }) {
  return (
    <figure className="my-6 overflow-x-auto pb-1">
      <div className="flex w-max items-stretch gap-2">
        {parts.map((part, i) => {
          const { role, text } = parse(part);
          const chip = cn(
            "rounded-md border px-3 py-1.5 text-center",
            role ? roles[role] : "border-transparent px-0 text-muted-foreground",
          );
          return (
            <div key={i} className="flex flex-col gap-2">
              <span className={cn(chip, "font-semibold")}>{text}</span>
              {example && (
                <span lang="en" className={chip}>
                  {example[i] ?? ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
