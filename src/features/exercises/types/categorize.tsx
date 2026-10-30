import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { categorizeDisplay, categorizeItems, type Status } from "../check";
import { dragAccessibility } from "./drag-accessibility";
import { statusClasses, type ItemProps } from "./item-props";

const t = es.exercises.types.categorize;

const wordId = (index: number) => `w${index}`;
const wordIndex = (id: UniqueIdentifier) => Number(String(id).slice(1));
const BANK = "bank";

// Palabra que se puede arrastrar o tocar
function WordChip({
  index,
  label,
  pressed,
  status,
  disabled,
  onClick,
  children,
}: {
  index: number;
  label?: string;
  pressed?: boolean;
  status?: Status;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: wordId(index),
    disabled,
  });
  return (
    <Button
      ref={setNodeRef}
      type="button"
      variant={pressed ? "default" : "outline"}
      lang="en"
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "h-9 touch-none text-base disabled:opacity-100",
        isDragging && "z-10 shadow-lg",
        status && statusClasses[status],
      )}
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      {...listeners}
    >
      {children}
    </Button>
  );
}

// Zona donde se sueltan palabras (el banco o un grupo)
function DropZone({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "ring-2 ring-primary")}>
      {children}
    </div>
  );
}

// Clasificar palabras en grupos (contable / incontable, a / an, -s / -es / -ies…)
export function Categorize({
  item,
  response,
  onChange,
  result,
  locked,
  seed,
}: ItemProps<"categorize">) {
  const words = useMemo(() => categorizeItems(item), [item]);
  const order = useMemo(() => categorizeDisplay(item, seed), [item, seed]);
  // Palabra seleccionada con un toque: estado solo de la interfaz, no de la respuesta
  const [selected, setSelected] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function place(word: number, category: number | null) {
    onChange({
      ...response,
      placed: words.map((_, i) => (i === word ? category : (response.placed[i] ?? null))),
    });
    setSelected(null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    place(wordIndex(active.id), over.id === BANK ? null : Number(String(over.id).slice(1)));
  }

  const unplaced = order.filter((i) => (response.placed[i] ?? null) === null);
  const selectedWord = selected === null ? undefined : words[selected]?.text;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        accessibility={dragAccessibility((id) => words[wordIndex(id)]?.text ?? "")}
      >
        <DropZone
          id={BANK}
          className="flex min-h-14 flex-wrap items-center gap-2 rounded-lg border-2 border-dashed p-3"
        >
          <span className="sr-only">{t.bank}</span>
          {unplaced.length === 0 && (
            <span className="text-sm text-muted-foreground">{t.allPlaced}</span>
          )}
          {unplaced.map((i) => (
            <WordChip
              key={i}
              index={i}
              pressed={selected === i}
              disabled={locked}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              {words[i]?.text}
            </WordChip>
          ))}
        </DropZone>

        <div className="grid gap-3 sm:grid-cols-2">
          {item.categories.map((category, ci) => (
            <DropZone
              key={category.label}
              id={`c${ci}`}
              className="space-y-2 rounded-lg border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p>
                  <strong lang="en">{category.label}</strong>
                  {category.labelEs && (
                    <span className="block text-sm text-muted-foreground">{category.labelEs}</span>
                  )}
                </p>
                {!locked && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={selected === null}
                    title={selected === null ? t.selectFirst : undefined}
                    aria-label={
                      selectedWord ? t.placeIn(selectedWord, category.label) : t.placeHere
                    }
                    onClick={() => selected !== null && place(selected, ci)}
                  >
                    {t.placeHere}
                  </Button>
                )}
              </div>
              <div className="flex min-h-9 flex-wrap gap-2">
                {order
                  .filter((i) => response.placed[i] === ci)
                  .map((i) => (
                    <WordChip
                      key={i}
                      index={i}
                      label={t.remove(words[i]?.text ?? "", category.label)}
                      status={result?.parts?.[i]}
                      disabled={locked}
                      onClick={() => place(i, null)}
                    >
                      {words[i]?.text}
                    </WordChip>
                  ))}
              </div>
            </DropZone>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
