"use client";

import { motion, useReducedMotion } from "framer-motion";

export function StaggerItem({ index, children }: { index: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: Math.min(index * 0.035, 0.21),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}
