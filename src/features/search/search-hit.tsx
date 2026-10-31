import { BookOpen, FlaskConical, GraduationCap, Languages, PencilLine } from "lucide-react";
import type { SearchHit as Hit, SearchType } from "./engine";

const icons: Record<SearchType, typeof BookOpen> = {
  unit: GraduationCap,
  lesson: BookOpen,
  tense: FlaskConical,
  set: PencilLine,
  word: Languages,
};

// Una fila de resultado: icono del tipo, título y subtítulo (traducción o sección)
export function SearchHit({ hit }: { hit: Hit }) {
  const Icon = icons[hit.type];
  return (
    <>
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span lang={hit.type === "word" ? "en" : undefined} className="font-medium">
        {hit.title}
      </span>
      {hit.subtitle && <span className="truncate text-muted-foreground">{hit.subtitle}</span>}
    </>
  );
}
