import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import type { Status } from "../check";
import { dragAccessibility } from "./drag-accessibility";
import { statusClasses } from "./item-props";

const t = es.exercises.types.tiles;

// La ficha tocada desaparece de su grupo; si se llevara el foco, quien usa teclado
// tendría que empezar a tabular desde arriba. Se pasa a la ficha vecina o, si no
// queda ninguna, al botón principal del formulario ("Comprobar").
function moveFocus(button: HTMLButtonElement) {
  const siblings = [...(button.parentElement?.querySelectorAll("button") ?? [])];
  const i = siblings.indexOf(button);
  const next = siblings[i + 1] ?? siblings[i - 1];
  const target = next ?? button.form?.querySelector<HTMLButtonElement>("button[type=submit]");
  target?.focus();
}

const tileId = (index: number) => `t${index}`;
const tileIndex = (id: UniqueIdentifier) => Number(String(id).slice(1));

// Ficha de la frase: se puede tocar (para quitarla) o arrastrar (para cambiarla de sitio)
function SortableTile({
  index,
  label,
  disabled,
  onRemove,
  children,
}: {
  index: number;
  label: string;
  disabled: boolean;
  onRemove: (button: HTMLButtonElement) => void;
  children: ReactNode;
}) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tileId(index),
    disabled,
  });
  return (
    <Button
      ref={setNodeRef}
      type="button"
      variant="secondary"
      lang="en"
      // La posición mientras se arrastra cambia en cada frame: va en style, no en una clase
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("h-9 touch-none text-base", isDragging && "z-10 shadow-lg")}
      disabled={disabled}
      aria-label={label}
      onClick={(event) => onRemove(event.currentTarget)}
      {...listeners}
    >
      {children}
    </Button>
  );
}

/**
 * Banco de fichas para formar una frase (word-order y translate con banco de palabras).
 * - Tocar una ficha del banco la añade al final de la frase; tocarla en la frase la quita.
 * - Con ratón o dedo, las fichas de la frase se pueden arrastrar para reordenarlas.
 */
export function TileBuilder({
  tokens,
  order,
  chosen,
  onChange,
  locked,
  status,
  instruction,
}: {
  tokens: readonly string[];
  order: readonly number[]; // orden barajado del banco
  chosen: readonly number[]; // fichas de la frase, en orden
  onChange: (chosen: number[]) => void;
  locked: boolean;
  status?: Status;
  instruction: string;
}) {
  // El arrastre empieza al mover 6 px: un toque sin movimiento sigue siendo un clic
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const used = new Set(chosen);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = chosen.indexOf(tileIndex(active.id));
    const to = chosen.indexOf(tileIndex(over.id));
    if (from >= 0 && to >= 0) onChange(arrayMove([...chosen], from, to));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{instruction}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={dragAccessibility((id) => tokens[tileIndex(id)] ?? "")}
      >
        <SortableContext items={chosen.map(tileId)} strategy={horizontalListSortingStrategy}>
          <div
            role="group"
            aria-label={t.answer}
            className={cn(
              "flex min-h-14 flex-wrap items-center gap-2 rounded-lg border-2 border-dashed p-3",
              status && statusClasses[status],
            )}
          >
            {chosen.length === 0 && (
              <span className="text-sm text-muted-foreground">{t.empty}</span>
            )}
            {chosen.map((index, position) => (
              <SortableTile
                key={index}
                index={index}
                label={t.remove(tokens[index] ?? "")}
                disabled={locked}
                onRemove={(button) => {
                  moveFocus(button);
                  onChange(chosen.filter((_, p) => p !== position));
                }}
              >
                {tokens[index]}
              </SortableTile>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div role="group" aria-label={t.bank} className="flex flex-wrap gap-2">
        {order.map((index) =>
          used.has(index) ? (
            // Hueco invisible del mismo tamaño: las demás fichas no se mueven de sitio
            <span
              key={index}
              aria-hidden
              className={cn(buttonVariants({ variant: "outline" }), "invisible h-9 text-base")}
            >
              {tokens[index]}
            </span>
          ) : (
            <Button
              key={index}
              type="button"
              variant="outline"
              lang="en"
              className="h-9 text-base"
              disabled={locked}
              onClick={(event) => {
                moveFocus(event.currentTarget);
                onChange([...chosen, index]);
              }}
            >
              {tokens[index]}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
