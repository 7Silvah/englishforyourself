import { isMatch, Link, useMatches } from "@tanstack/react-router";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Cada ruta que quiere aparecer aquí devuelve { crumb: "Texto" } en su loader.
// Las rutas coincidentes (matches) van de la raíz a la página actual, así que el
// orden de las migas sale solo de la estructura de carpetas de src/routes/.
export function Breadcrumbs() {
  const matches = useMatches();
  if (matches.some((match) => match.status === "pending")) return null;

  const crumbs = matches.filter((match) => isMatch(match, "loaderData.crumb"));
  // En la portada solo existiría "Inicio": no hace falta mostrarla.
  if (crumbs.length < 2) return null;

  return (
    <Breadcrumb className="mx-auto max-w-6xl px-4 pt-4">
      <BreadcrumbList>
        {crumbs.map((match, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={match.id}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{match.loaderData?.crumb}</BreadcrumbPage>
                ) : (
                  // Sin "to", Link apunta a la propia ruta indicada en "from"
                  <BreadcrumbLink render={<Link from={match.fullPath} />}>
                    {match.loaderData?.crumb}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
