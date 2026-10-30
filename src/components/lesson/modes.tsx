import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { toneSolid, toneSoft } from "./tones";

const order = ["pos", "neg", "q", "nq"] as const;
type Mode = (typeof order)[number];

/**
 * La misma frase en afirmativa, negativa y pregunta, con los colores fijos del sitio
 * y el nombre de cada forma (el color nunca va solo):
 *   <Modes pos="She works here." neg="She doesn't work here." q="Does she work here?" />
 */
export function Modes(props: Partial<Record<Mode, string>>) {
  return (
    <dl className="my-6 overflow-hidden rounded-lg border">
      {order.map((mode) => {
        const sentence = props[mode];
        if (!sentence) return null;
        return (
          <div
            key={mode}
            className={cn("flex flex-wrap items-center gap-3 px-3 py-2", toneSoft[mode])}
          >
            <dt
              className={cn(
                "w-36 shrink-0 rounded px-2 py-0.5 text-center text-sm font-semibold",
                toneSolid[mode],
              )}
            >
              {es.lesson.modes[mode]}
            </dt>
            <dd lang="en" className="text-base">
              {sentence}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
