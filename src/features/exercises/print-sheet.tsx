import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { Printer } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import {
  isSupported,
  sentenceTokens,
  wordOrderDisplay,
  wordOrderTokens,
  type SupportedItem,
} from "./check";
import type { ExerciseSet } from "./schema";
import { answerKey, splitBlanks } from "./solution";

const t = es.exercises;

// Línea para escribir a mano
function Line({ wide = false }: { wide?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block border-b border-foreground align-baseline",
        wide ? "mt-3 block h-6 w-full" : "mx-1 w-32",
      )}
    />
  );
}

function WithBlanks({ text }: { text: string }) {
  return splitBlanks(text).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <Line />}
      {part}
    </Fragment>
  ));
}

function PrintItem({ item, seed }: { item: SupportedItem; seed: string }) {
  switch (item.type) {
    case "fill-blank":
      return (
        <p lang="en">
          <WithBlanks text={item.text} />
        </p>
      );
    case "multiple-choice":
      return (
        <>
          <p lang="en">
            <WithBlanks text={item.prompt} />
          </p>
          <ol lang="en" className="mt-1 flex list-[lower-alpha] flex-wrap gap-x-10 pl-5">
            {item.options.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ol>
        </>
      );
    case "true-false":
      return (
        <p>
          <span lang="en">{item.statement}</span>{" "}
          <span className="text-muted-foreground">({t.printPage.trueFalse})</span>
        </p>
      );
    case "word-order": {
      const tokens = wordOrderTokens(item);
      return (
        <p lang="en">
          {wordOrderDisplay(item, seed)
            .map((i) => tokens[i])
            .join("  /  ")}
          <Line wide />
        </p>
      );
    }
    case "transform":
      return (
        <p>
          <span lang="en">{item.source}</span>{" "}
          <span className="text-muted-foreground">
            → {t.printPage.form} {t.types.transform.to[item.to]}
          </span>
          <Line wide />
        </p>
      );
    case "error-correction":
      return (
        <p>
          <span lang="en">{sentenceTokens(item.sentence).join(" ")}</span>{" "}
          <span className="text-muted-foreground">({t.printPage.fixError})</span>
          <Line wide />
        </p>
      );
  }
}

// Hoja para imprimir o guardar como PDF desde el navegador (sustituye a los PDF originales).
// Las clases "print:" de Tailwind solo se aplican al imprimir.
export function PrintSheet({ id, set }: { id: string; set: ExerciseSet }) {
  const items = set.items.filter(isSupported);

  return (
    <article className="mx-auto max-w-3xl print:max-w-none print:text-[11pt]">
      <div className="mb-8 flex flex-wrap gap-2 print:hidden">
        <Button onClick={() => window.print()}>
          <Printer data-icon="inline-start" aria-hidden />
          {t.print}
        </Button>
        <Link
          to="/ejercicios/$id"
          params={{ id }}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {t.printPage.back}
        </Link>
      </div>

      <header className="space-y-1 border-b pb-4">
        <h1 className="font-heading text-2xl font-bold">{set.titleEs}</h1>
        {set.title !== set.titleEs && (
          <p lang="en" className="text-muted-foreground">
            {set.title}
          </p>
        )}
        <p>{set.instructionEs}</p>
        <p className="flex gap-8 pt-4">
          <span className="flex flex-1 items-end">
            {t.printPage.name} <Line />
          </span>
          <span className="flex items-end">
            {t.printPage.date} <Line />
          </span>
        </p>
      </header>

      <ol className="mt-6 list-decimal space-y-5 pl-6 marker:font-semibold">
        {items.map((item) => (
          <li key={item.id} className="break-inside-avoid pl-1">
            <PrintItem item={item} seed={`${id}#${item.id}`} />
          </li>
        ))}
      </ol>

      {/* La clave empieza en una página nueva para poder separarla */}
      <section className="mt-12 border-t pt-6 print:mt-0 print:break-before-page print:border-0">
        <h2 className="mb-4 text-lg font-semibold">{t.printPage.key}</h2>
        <ol lang="en" className="list-decimal columns-2 gap-8 space-y-1 pl-6 text-sm">
          {items.map((item) => (
            <li key={item.id} className="break-inside-avoid">
              {answerKey(item)}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
