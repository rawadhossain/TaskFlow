"use client";

import { useEffect, useState } from "react";

export function useSearchShortcutHint(): string {
  const [hint, setHint] = useState("Ctrl+K");

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const plat = typeof navigator !== "undefined" ? (navigator.platform ?? "").toLowerCase() : "";
    const mac = plat.includes("mac") || ua.includes("mac os");
    setHint(mac ? "⌘K" : "Ctrl+K");
  }, []);

  return hint;
}
