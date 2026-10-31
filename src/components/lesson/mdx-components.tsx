// Cómo se ve cada elemento de una lección MDX. Se pasa a <Content components={mdxComponents} />.
// Aquí se registran también los componentes que el MDX puede usar (Examples, GrammarTable…).
import type { ComponentPropsWithoutRef } from "react";
import { CommonMistake } from "./common-mistake";
import { Examples } from "./examples";
import { Explain } from "./explain";
import { FalseFriend } from "./false-friend";
import { Formula } from "./formula";
import { GrammarTable } from "./grammar-table";
import { MdxLink } from "./mdx-link";
import { MdxListItem } from "./mdx-list-item";
import { Modes } from "./modes";
import { Tip } from "./tip";

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-4 scroll-mt-20 font-heading text-2xl font-bold tracking-tight"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-3 scroll-mt-20 font-heading text-xl font-semibold" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-6 mb-2 scroll-mt-20 font-heading text-lg font-semibold" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="my-3 leading-7" {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-3 list-disc space-y-1 pl-6 marker:text-muted-foreground" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-3 list-decimal space-y-1 pl-6 marker:text-muted-foreground" {...props} />
  ),
  li: MdxListItem, // dentro de <Examples> añade el botón 🔊
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  a: MdxLink,
  hr: () => <hr className="my-8" />,
  // Tablas escritas en Markdown (GFM) dentro de las unidades
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="border-b bg-muted px-3 py-2 text-left font-semibold" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b px-3 py-2 align-top [tr:last-child_&]:border-b-0" {...props} />
  ),
  Examples,
  GrammarTable,
  Formula,
  Modes,
  Explain,
  Tip,
  CommonMistake,
  FalseFriend,
};
