import type { Announcements, UniqueIdentifier } from "@dnd-kit/core";
import { es } from "@/i18n/es";

const t = es.exercises.drag;

// dnd-kit anuncia por defecto en inglés lo que pasa al arrastrar (para lectores de
// pantalla). Aquí se traducen esos avisos usando el texto de cada ficha.
export function dragAccessibility(labelOf: (id: UniqueIdentifier) => string): {
  announcements: Announcements;
  screenReaderInstructions: { draggable: string };
} {
  return {
    screenReaderInstructions: { draggable: t.instructions },
    announcements: {
      onDragStart: ({ active }) => t.start(labelOf(active.id)),
      onDragOver: ({ active, over }) => (over ? t.over(labelOf(active.id)) : undefined),
      onDragEnd: ({ active, over }) =>
        over ? t.dropped(labelOf(active.id)) : t.cancelled(labelOf(active.id)),
      onDragCancel: ({ active }) => t.cancelled(labelOf(active.id)),
    },
  };
}
