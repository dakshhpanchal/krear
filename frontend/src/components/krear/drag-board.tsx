import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BoardItem {
  id: number;
  column: string;
}

interface BoardProps<T extends BoardItem> {
  columns: { id: string; label: string }[];
  items: T[];
  renderCard: (item: T) => ReactNode;
  onMove: (itemId: number, column: string) => void;
  emptyHint?: string;
}

function SortableCard({ id, children }: { id: number; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "paper-card group relative p-4 transition-shadow",
        isDragging && "opacity-40",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag card"
        className="absolute right-2 top-3 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      {children}
    </div>
  );
}

function Column({
  id,
  label,
  count,
  children,
}: {
  id: string;
  label: string;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${id}` });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[22rem] w-[19rem] shrink-0 flex-col gap-3 rounded-3xl border border-dashed border-border p-3 transition-colors",
        isOver && "border-foreground bg-accent/60",
      )}
    >
      <div className="flex items-center justify-between px-2 pt-1">
        <span className="mono-label">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function DragBoard<T extends BoardItem>({
  columns,
  items,
  renderCard,
  onMove,
  emptyHint = "Drop here",
}: BoardProps<T>) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const active = items.find((i) => i.id === activeId) ?? null;

  function handleStart(e: DragStartEvent) {
    setActiveId(Number(e.active.id));
  }

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active: a, over } = e;
    if (!over) return;
    const overId = String(over.id);
    const itemId = Number(a.id);
    const current = items.find((i) => i.id === itemId);
    if (!current) return;

    const targetColumn = overId.startsWith("col:")
      ? overId.slice(4)
      : items.find((i) => i.id === Number(overId))?.column;

    if (targetColumn && targetColumn !== current.column) onMove(itemId, targetColumn);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-6">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.column === col.id);
          return (
            <Column key={col.id} id={col.id} label={col.label} count={colItems.length}>
              <SortableContext
                items={colItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {colItems.map((item) => (
                  <SortableCard key={item.id} id={item.id}>
                    {renderCard(item)}
                  </SortableCard>
                ))}
              </SortableContext>
              {colItems.length === 0 && (
                <p className="px-2 py-6 text-center font-mono text-xs text-muted-foreground">
                  {emptyHint}
                </p>
              )}
            </Column>
          );
        })}
      </div>

      <DragOverlay>
        {active ? (
          <div className="paper-card w-[17rem] rotate-2 p-4 shadow-[var(--shadow-lift)]">
            {renderCard(active)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
