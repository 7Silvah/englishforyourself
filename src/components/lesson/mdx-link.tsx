import { Link } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef } from "react";

const className = "font-medium text-primary underline-offset-4 hover:underline";

// Enlaces de las lecciones: internos con el router (sin recargar la página), externos en otra pestaña
export function MdxLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) return <Link to={href} className={className} {...props} />;
  return <a href={href} className={className} target="_blank" rel="noreferrer" {...props} />;
}
