// HTML (ya limpiado por lessons.ts) → texto MDX.
//
// Los componentes se marcan antes con códigos en párrafos propios:
//   EFYEXSTART / EFYEXEND  → <Examples> … </Examples>
//   EFYTABLE3EFY           → <GrammarTable data={table3} />
// Así la conversión HTML → Markdown la hace entera unified, y remark-mdx se ocupa
// de escapar los caracteres que MDX interpretaría como código ({, <).
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkMdx)
  .use(remarkStringify, { bullet: "-", emphasis: "*", strong: "*", rule: "-" });

export async function htmlToMdx(html: string): Promise<string> {
  const markdown = String(await processor.process(html));
  return markdown
    .replace(/^EFYEXSTART$/gm, "<Examples>")
    .replace(/^EFYEXEND$/gm, "</Examples>")
    .replace(/^EFYTABLE(\d+)EFY$/gm, "<GrammarTable data={table$1} />")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
