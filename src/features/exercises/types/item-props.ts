import type { CheckResult, ItemOf, ResponseOf, Status, SupportedType } from "../check";

// Props comunes de los componentes de tipo: son "controlados" (la respuesta vive en
// el player y llega por props; el componente solo avisa de los cambios con onChange).
export type ItemProps<T extends SupportedType> = {
  item: ItemOf<T>;
  response: ResponseOf<T>;
  onChange: (response: ResponseOf<T>) => void;
  result: CheckResult | null; // null mientras no se ha corregido
  locked: boolean; // ya corregido: no se puede cambiar la respuesta
  seed: string; // para barajar fichas y opciones siempre igual
};

// Colores de estado (tokens de index.css). Siempre van acompañados de icono o texto.
export const statusClasses: Record<Status, string> = {
  correct: "border-correct-border bg-correct text-correct-fg",
  almost: "border-almost-border bg-almost text-almost-fg",
  wrong: "border-wrong-border bg-wrong text-wrong-fg",
};
