import { cn } from "@/lib/utils";

// Colores fijos de los bloques del Tense Lab: sujeto azul, auxiliar ámbar, verbo verde, resto gris
const roles = {
  subj: "border-subj-border bg-subj text-subj-fg",
  aux: "border-aux-border bg-aux text-aux-fg",
  verb: "border-verb-border bg-verb text-verb-fg",
  obj: "border-obj-border bg-obj text-obj-fg",
} as const;

type Role = keyof typeof roles;

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
