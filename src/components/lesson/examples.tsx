import type { ReactNode } from "react";
import { ExamplesContext } from "./examples-context";

// Frases de ejemplo en inglés. En el MDX van como lista dentro de <Examples>:
//   <Examples>
//   - I went to Mexico last month.
//   </Examples>
// Cada frase lleva su botón 🔊 (ver MdxListItem).
export function Examples({ children }: { children: ReactNode }) {
  return (
    <ExamplesContext value={true}>
      <div
        lang="en"
        className="my-4 rounded-lg border-l-4 border-primary/60 bg-muted/40 px-4 py-3 [&_li]:py-0.5 [&_ul]:m-0 [&_ul]:list-none [&_ul]:space-y-0.5 [&_ul]:p-0"
      >
        {children}
      </div>
    </ExamplesContext>
  );
}
