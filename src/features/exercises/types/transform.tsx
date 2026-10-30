import { toneSoft } from "@/components/lesson/tones";
import { Input } from "@/components/ui/input";
import type { Tone } from "@/content/schema";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import type { ItemOf } from "../check";
import { statusClasses, type ItemProps } from "./item-props";

const t = es.exercises.types.transform;

// Los modos gramaticales llevan su color fijo (pos verde, neg naranja, q amarillo)
const tones: Partial<Record<ItemOf<"transform">["to"], Tone>> = {
  pos: "pos",
  neg: "neg",
  q: "q",
  nq: "nq",
};

export function Transform({ item, response, onChange, result, locked }: ItemProps<"transform">) {
  const tone = tones[item.to];
  return (
    <div className="space-y-4">
      <p lang="en" className="rounded-lg bg-muted/50 p-4 text-lg">
        {item.source}
      </p>
      <label className="block space-y-2">
        <span className="text-sm">
          {t.instruction}{" "}
          <strong className={cn("rounded px-1.5 py-0.5", tone && toneSoft[tone])}>
            {t.to[item.to]}
          </strong>
          :
        </span>
        <Input
          value={response.text}
          onChange={(e) => onChange({ ...response, text: e.target.value })}
          readOnly={locked}
          autoFocus
          lang="en"
          placeholder={t.input}
          aria-invalid={result?.status === "wrong" || undefined}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn("h-10 text-lg md:text-lg", result && statusClasses[result.status])}
        />
      </label>
    </div>
  );
}
