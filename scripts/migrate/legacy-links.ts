// Traduce los enlaces del sitio antiguo a las URLs de la app nueva.
import path from "node:path";
import { worksheetMap } from "./worksheet-map";

// fromFile: ruta del HTML que contiene el enlace, relativa a legacy/ ("lessons/grammar/articles.html")
// Devuelve la URL nueva, o null si el destino ya no existe (el enlace se convierte en texto).
export function rewriteHref(href: string, fromFile: string): string | null {
  if (/^(https?:|mailto:)/.test(href)) return href;
  if (href.startsWith("#")) return href;

  const [target = "", hash] = href.split("#");
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), target));
  const suffix = hash ? `#${hash}` : "";

  if (resolved === "index.html") return "/";
  if (resolved === "about.html") return "/acerca";
  if (resolved.startsWith("legal/")) return null; // páginas del sitio original que no se migran

  const pdf = resolved.match(/^assets\/pdf\/(.+\.pdf)$/);
  if (pdf?.[1]) {
    const info = worksheetMap[pdf[1]];
    return info ? `/ejercicios/${info.id}` : null;
  }

  const lesson = resolved.match(/^lessons\/([^/]+)\/(.+)\.html$/);
  if (lesson?.[1] && lesson[2]) {
    const [, section, slug] = lesson;
    if (section === "worksheets") return "/ejercicios";
    if (slug === "index") return `/biblioteca/${section}${suffix}`;
    return `/biblioteca/${section}/${slug}${suffix}`;
  }
  return null;
}
