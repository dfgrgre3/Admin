"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { usePremiumSounds } from "@/hooks/use-premium-sounds";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = React.memo(function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: "none",
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
      id={id}
      role="article"
      aria-label={`قسم ${id}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary z-20 hidden xl:block focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
        aria-label={`نقل القسم ${id}`}
        type="button"
      >
        <GripVertical className="w-6 h-6" aria-hidden="true" />
      </button>
      <div className={isDragging ? "opacity-90" : undefined}>
        {children}
      </div>
    </div>
  );
});

interface DraggableDashboardProps {
  children: Array<{ id: string; content: React.ReactNode }>;
  onOrderChange?: (newOrder: string[]) => void;
}

type DashboardChild = { id: string; content: React.ReactNode };

const EMPTY_ARRAY: readonly DashboardChild[] = [];
const STORAGE_KEY = "admin-dashboard-layout";

export function DraggableDashboard({ children: initialChildren, onOrderChange }: DraggableDashboardProps) {
  const children = initialChildren || EMPTY_ARRAY;
  const { playSound } = usePremiumSounds();

  const defaultOrder = React.useMemo(
    () => children.map((c: DashboardChild) => String(c.id)),
    [children]
  );

  const [items, setItems] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return defaultOrder;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedOrder = JSON.parse(saved) as string[];
        const currentIds = new Set(defaultOrder);
        const validSavedOrder = Array.from(new Set(savedOrder.filter((id) => currentIds.has(id))));
        const newIds = defaultOrder.filter((id) => !validSavedOrder.includes(id));
        return [...validSavedOrder, ...newIds];
      }
    } catch {
      // Ignore localStorage errors
    }
    return defaultOrder;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(items))));
    } catch {
      // Ignore localStorage errors
    }
  }, [items]);

  const childrenIds = React.useMemo(() => {
    const seen = new Set<string>();
    return children.map((c: DashboardChild) => c.id).filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [children]);
  const childrenIdsKey = childrenIds.join(",");
  const itemsKey = items.join(",");

  React.useEffect(() => {
    if (childrenIdsKey !== itemsKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems((prev) => {
        const currentIds = childrenIds;
        const existingIds = new Set(prev);
        const validExisting: string[] = [];
        const seen = new Set<string>();
        for (const id of prev) {
          if (currentIds.includes(id) && !seen.has(id)) {
            validExisting.push(id);
            seen.add(id);
          }
        }
        const newOnes = currentIds.filter((id) => !existingIds.has(id));
        const result = [...validExisting, ...newOnes];
        if (result.length === prev.length && result.every((id, i) => id === prev[i])) {
          return prev;
        }
        return result;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenIdsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = React.useCallback(() => {
    playSound("drag-start");
  }, [playSound]);

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as string);
        const newIndex = currentItems.indexOf(over?.id as string);
        const newLayout = arrayMove(currentItems, oldIndex, newIndex);
        onOrderChange?.(newLayout);
        return newLayout;
      });
      playSound("drag-end");
    }
  }, [playSound, onOrderChange]);

  const resetLayout = React.useCallback(() => {
    const defaultOrder = children.map((c: DashboardChild) => String(c.id));
    setItems(defaultOrder);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [children]);

  const orderedContents = React.useMemo(
    () => items.map(id => children.find(c => c.id === id)).filter(Boolean),
    [items, children]
  );

  return (
    <div role="region" aria-label="لوحة التحكم القابلة للترتيب" aria-describedby="dashboard-layout-help">
      {/* Layout Help Text (visually hidden) */}
      <p id="dashboard-layout-help" className="sr-only">
        يمكنك إعادة ترتيب الأقسام باستخدام أزرار النقل. استخدم زر إعادة الترتيب الافتراضي لاستعادة الترتيب الأصلي.
      </p>

      {/* Reset Layout Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={resetLayout}
          className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          title="إعادة ترتيب الأقسام للوضع الافتراضي"
          type="button"
          aria-label="إعادة ترتيب الأقسام للوضع الافتراضي"
        >
          إعادة الترتيب الافتراضي
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-12" aria-live="polite">
            {orderedContents.map((item) => (
              <SortableItem key={item!.id} id={item!.id}>
                {item!.content}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
