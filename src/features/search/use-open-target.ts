import { useNavigate } from "@tanstack/react-router";
import { TENSES } from "@/content/data/tense-index";
import type { SearchTarget } from "./engine";

/** Devuelve una función que navega al destino de un resultado del buscador */
export function useOpenTarget() {
  const navigate = useNavigate();
  return (target: SearchTarget) => {
    switch (target.kind) {
      case "lesson":
        return navigate({
          to: "/biblioteca/$section/$",
          params: { section: target.section, _splat: target.slug },
        });
      case "unit":
        return navigate({ to: "/curso/$unidad", params: { unidad: target.slug } });
      case "set":
        return navigate({ to: "/ejercicios/$id", params: { id: target.id } });
      case "tense":
        return navigate({
          to: "/herramientas/tense-lab",
          search: { tense: TENSES.find((t) => t.id === target.id)?.id },
        });
    }
  };
}
