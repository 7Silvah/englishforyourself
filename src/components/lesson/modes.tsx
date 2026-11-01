import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { toneSolid, toneSoft } from "./tones";

const order = ["pos", "neg", "q", "nq"] as const;
type Mode = (typeof order)[number];

const topBorder: Record<Mode, string> = {
  pos: "border-t-pos",
  neg: "border-t-neg",
  q: "border-t-q",
  nq: "border-t-nq",
};

/**
 * La misma frase en afirmativa, negativa y pregunta, con los colores fijos del sitio
 * y el nombre de cada forma (el color nunca va solo):
 *   <Modes pos="She works here." neg="She doesn't work here." q="Does she work here?" />
 */
export function Modes(props: Partial<Record<Mode, string>>) {
  // Con 3 modos, una fila; con 2 o 4, de dos en dos (nunca una tarjeta sola en la última fila)
  const count = order.filter((mode) => props[mode]).length;
  return (
    <dl className={cn("my-6 grid gap-3", count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {order.map((mode) => {
        const sentence = props[mode];
        if (!sentence) return null;
        return (
          <div
            key={mode}
            className={cn(
              "flex flex-col gap-2 rounded-xl border border-t-4 bg-card p-3",
              topBorder[mode],
            )}
          >
            <dt>
              <span
                className={cn(
                  "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  toneSolid[mode],
                )}
              >
                {es.lesson.modes[mode]}
              </span>
            </dt>
            <dd lang="en" className={cn("rounded-lg px-3 py-2 text-lg", toneSoft[mode])}>
              {sentence}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
