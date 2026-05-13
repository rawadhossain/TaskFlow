export const TAG_COLOR_PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
] as const;

export type TagPaletteColor = (typeof TAG_COLOR_PALETTE)[number];

export function nextPaletteColor(current: string): TagPaletteColor {
  const idx = TAG_COLOR_PALETTE.indexOf(current as TagPaletteColor);
  const next = idx === -1 ? 0 : (idx + 1) % TAG_COLOR_PALETTE.length;
  return TAG_COLOR_PALETTE[next]!;
}
