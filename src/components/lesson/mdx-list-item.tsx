import { use, useRef, type ComponentPropsWithoutRef } from "react";
import { ExamplesContext } from "./examples-context";
import { SpeakButton } from "./speak-button";

// <li> de las lecciones MDX. Dentro de <Examples> añade un botón 🔊 que lee la frase.
// El texto se toma del propio elemento al pulsar (las frases pueden llevar negrita, etc.).
export function MdxListItem({ children, ...props }: ComponentPropsWithoutRef<"li">) {
  const inExamples = use(ExamplesContext);
  const textRef = useRef<HTMLSpanElement>(null);
  if (!inExamples)
    return (
      <li className="leading-7" {...props}>
        {children}
      </li>
    );
  return (
    <li className="flex items-center gap-1 leading-7" {...props}>
      <span ref={textRef}>{children}</span>
      <SpeakButton text={() => textRef.current?.textContent ?? ""} className="size-7" />
    </li>
  );
}
