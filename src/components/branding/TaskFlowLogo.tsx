import { cn } from "@/lib/utils";

export function TaskFlowMark({
  className,
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden={ariaHidden}
    >
      <rect
        x="2.25"
        y="2.75"
        width="12.75"
        height="18.5"
        rx="3.25"
        className="stroke-border fill-elevated/40"
        strokeWidth="1"
      />
      <path
        d="M5.25 8h7"
        stroke="currentColor"
        strokeOpacity="0.38"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M5.25 11.25h5"
        stroke="currentColor"
        strokeOpacity="0.38"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <g className="text-primary">
        <circle
          cx="6.35"
          cy="15.35"
          r="2.45"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="none"
          opacity="0.33"
        />
        <path
          d="M5.05 15.35l.72.82 1.86-2.55"
          stroke="currentColor"
          strokeWidth="1.28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M15.85 5.35c3.35 2.05 5.05 5.25 4.55 9.05-.35 2.85-2.1 5.05-4.65 6.05"
        className="stroke-primary"
        strokeWidth="1.45"
        strokeLinecap="round"
        opacity="0.92"
      />
      <circle cx="17.85" cy="19.85" r="1.85" className="fill-primary/55" />
    </svg>
  );
}

export function TaskFlowWordmark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sz = size === "sm" ? "text-[0.9375rem]" : size === "lg" ? "text-[1.35rem]" : "text-xl";
  return (
    <span
      className={cn(
        "font-mono font-bold tracking-[-0.03em] text-foreground tabular-nums",
        sz,
        className,
      )}
    >
      Task-<span className="text-primary">Flow</span>
    </span>
  );
}
