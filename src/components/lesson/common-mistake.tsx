import { Check, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { es } from "@/i18n/es";
import { Callout } from "./callout";

/**
 * Error típico de hispanohablantes, con la versión correcta y el porqué:
 *   <CommonMistake wrong="I have 20 years." right="I am 20 years old.">
 *   La edad se dice con to be.
 *   </CommonMistake>
 */
export function CommonMistake({
  wrong,
  right,
  children,
}: {
  wrong: string;
  right: string;
  children?: ReactNode;
}) {
  return (
    <Callout Icon={TriangleAlert} title={es.lesson.commonMistake}>
      <p className="flex items-start gap-2 text-wrong-fg">
        <X className="mt-1 size-4 shrink-0" aria-hidden />
        <span>
          <span className="sr-only">{es.lesson.wrong}: </span>
          <s lang="en">{wrong}</s>
        </span>
      </p>
      <p className="flex items-start gap-2 text-correct-fg">
        <Check className="mt-1 size-4 shrink-0" aria-hidden />
        <span>
          <span className="sr-only">{es.lesson.right}: </span>
          <strong lang="en">{right}</strong>
        </span>
      </p>
      {children && <div className="text-muted-foreground">{children}</div>}
    </Callout>
  );
}
