"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ApiTaskRow } from "@/types";

function cloneRows(list: ApiTaskRow[]): ApiTaskRow[] {
  return list.map((t) => ({
    ...t,
    tags: t.tags.map((tag) => ({ ...tag })),
    subtasks: t.subtasks.map((s) => ({ ...s })),
  }));
}

type UseDragReorderOptions = {
  items: ApiTaskRow[];
  enabled: boolean;
  onReorder: (next: ApiTaskRow[]) => void;
  persistOrder: (ids: string[]) => Promise<unknown>;
};

export function useDragReorder({ items, enabled, onReorder, persistOrder }: UseDragReorderOptions) {
  const [orderedItems, setOrderedItems] = useState<ApiTaskRow[]>(() => items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshotRef = useRef<ApiTaskRow[] | null>(null);
  const orderedRef = useRef<ApiTaskRow[]>(orderedItems);

  const itemsSyncKey = useMemo(
    () => items.map((t) => `${t.id}:${t.updatedAt}:${t.position}`).join("|"),
    [items],
  );

  useEffect(() => {
    orderedRef.current = orderedItems;
  }, [orderedItems]);

  /** Sync local order from server when not actively dragging (`activeId === null`). */
  useEffect(() => {
    if (!enabled) {
      setOrderedItems(items);
      return;
    }
    if (activeId !== null) return;
    setOrderedItems(items);
  }, [items, enabled, activeId, itemsSyncKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!enabled) return;
      snapshotRef.current = cloneRows(orderedRef.current);
      setActiveId(String(event.active.id));
    },
    [enabled],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!enabled) {
        setActiveId(null);
        return;
      }

      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) {
        snapshotRef.current = null;
        return;
      }

      const list = orderedRef.current;
      const oldIndex = list.findIndex((t) => t.id === active.id);
      const newIndex = list.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) {
        snapshotRef.current = null;
        return;
      }

      const next = arrayMove(list, oldIndex, newIndex);
      orderedRef.current = next;
      setOrderedItems(next);
      onReorder(next);

      try {
        await persistOrder(next.map((t) => t.id));
      } catch {
        const snap = snapshotRef.current;
        if (snap) {
          orderedRef.current = snap;
          setOrderedItems(snap);
          onReorder(snap);
        }
      } finally {
        snapshotRef.current = null;
      }
    },
    [enabled, onReorder, persistOrder],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    const snap = snapshotRef.current;
    if (snap) {
      orderedRef.current = snap;
      setOrderedItems(snap);
      onReorder(snap);
    }
    snapshotRef.current = null;
  }, [onReorder]);

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    activeId,
    items: orderedItems,
  };
}
