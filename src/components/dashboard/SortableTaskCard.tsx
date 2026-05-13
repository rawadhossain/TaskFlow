"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, useReducedMotion } from "framer-motion";

import { TaskCard } from "@/components/dashboard/TaskCard";
import type { Task } from "@/lib/mock-tasks";

export function SortableTaskCard({
  id,
  task,
  listIndex,
  onToggle,
  onDelete,
  onEdit,
}: {
  id: string;
  task: Task;
  listIndex: number;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
}) {
  const reduce = useReducedMotion();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  const inner = (
    <TaskCard
      task={task}
      onToggle={onToggle}
      onDelete={onDelete}
      onEdit={onEdit}
      sortable={{
        setActivatorNodeRef,
        listeners,
        attributes,
        isDragging,
      }}
    />
  );

  if (reduce) {
    return (
      <div ref={setNodeRef} style={style}>
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.03 : 1,
        rotateZ: isDragging ? 2 : 0,
      }}
      transition={{ duration: 0.18, delay: Math.min(listIndex * 0.03, 0.18) }}
    >
      {inner}
    </motion.div>
  );
}
