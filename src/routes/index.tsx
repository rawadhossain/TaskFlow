"use client";

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  CalendarDays,
  Tag,
  LayoutDashboard,
  Flame,
  ArrowRight,
  AlarmClock,
  Repeat,
  SlidersHorizontal,
  Trash2,
  GripVertical,
  Star,
  ArrowUpRight,
} from "lucide-react";

import { TaskFlowMark, TaskFlowWordmark } from "@/components/branding/TaskFlowLogo";
import { getSession } from "@/lib/auth.functions";
import { taskQuerySchema } from "@/lib/validations/task-query.schema";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) throw redirect({ to: "/tasks", search: taskQuerySchema.parse({}) });
  },
  component: LandingPage,
});

const PAIN = [
  {
    id: "p1",
    title: "Tasks scattered everywhere",
    body: "Notes app, sticky notes, email drafts, chat messages — your to-dos live in six places and you forget half of them.",
  },
  {
    id: "p2",
    title: "No sense of today's priority",
    body: "Everything feels equally urgent. You open your list and freeze. The most important thing gets pushed again.",
  },
  {
    id: "p3",
    title: "Progress disappears into noise",
    body: "You shipped things, you closed loops — but your task manager shows a wall of undone items and zero momentum.",
  },
] as const;

const FEATURES = [
  {
    id: "f1",
    icon: LayoutDashboard,
    title: "All tasks, one view",
    body: "Filter, search, sort by status, priority, tag or due date — always surfacing what matters most.",
    tags: ["search", "filter", "sort"],
  },
  {
    id: "f2",
    icon: CalendarDays,
    title: "Today view",
    body: "See exactly what is due today and what is overdue. Nothing to remember, nothing to miss.",
    tags: ["focus", "due today"],
  },
  {
    id: "f3",
    icon: AlarmClock,
    title: "Upcoming view",
    body: "A rolling 7-day horizon so you can plan ahead without a spreadsheet.",
    tags: ["7 days", "planning"],
  },
  {
    id: "f4",
    icon: CheckCircle2,
    title: "Completion archive",
    body: "Completed tasks are never deleted — they move to an archive grouped by week, so you can see your streak.",
    tags: ["wins", "history"],
  },
  {
    id: "f5",
    icon: Tag,
    title: "Color-coded tags",
    body: "Create tags with custom colors and filter your entire list to a single topic in one click.",
    tags: ["tags", "colors"],
  },
  {
    id: "f6",
    icon: Repeat,
    title: "Three-state toggle",
    body: "Pending → In progress → Done. Cycle with a single click; undo a delete with a 5-second toast.",
    tags: ["toggle", "undo"],
  },
  {
    id: "f7",
    icon: GripVertical,
    title: "Drag-to-reorder",
    body: "Manually order tasks the way you think, not the way an algorithm sorts them.",
    tags: ["drag", "manual"],
  },
  {
    id: "f8",
    icon: SlidersHorizontal,
    title: "Smart stats ring",
    body: "See today's progress as a ring: tasks due today vs completed. Streak keeps you coming back.",
    tags: ["stats", "streak"],
  },
  {
    id: "f9",
    icon: Trash2,
    title: "Soft delete + trash",
    body: "Nothing is gone forever. Deleted tasks sit in trash; restore or purge permanently when you're ready.",
    tags: ["trash", "restore"],
  },
] as const;

const HOW_STEPS = [
  {
    id: "h1",
    num: "01",
    title: "Capture",
    body: "Hit the quick-add bar or press N — type a title, pick a priority and due date, attach tags. Done in under 10 seconds.",
    preview: ["$ Add task…", "> Walk the dog", "> Priority: Medium · Due: Today", "✓ Task created"],
  },
  {
    id: "h2",
    num: "02",
    title: "Organise",
    body: "Drag to set your own order, filter by tag or due date, and let the Today view surface the most urgent work automatically.",
    preview: ["$ View: Today", "> 3 tasks due", "> 1 overdue (!)", "→ Opening Today…"],
  },
  {
    id: "h3",
    num: "03",
    title: "Ship",
    body: "Toggle a task complete, watch the ring fill, and earn your daily streak. The momentum card updates instantly.",
    preview: [
      "$ Toggle task",
      "> PENDING → IN_PROGRESS",
      "> IN_PROGRESS → COMPLETED",
      "🔥 1 day streak!",
    ],
  },
] as const;

const LANDING_NAV_LINKS = [
  { label: "Why Task-Flow", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Get started", href: "#cta" },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <LandingNav />
      <main>
        <HeroSection />
        <PainSection />
        <HowSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={[
        "fixed top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-[100] -translate-x-1/2",
        "w-[calc(100vw-1.25rem)] max-w-[71.25rem]",
        "rounded-2xl border border-border/50",
        "bg-card/65 backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "transition-[background-color,box-shadow,border-color] duration-300 ease-out",
        scrolled
          ? "bg-card/85 border-border/65 shadow-[0_12px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "",
      ].join(" ")}
      id="landing-nav"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex min-h-14 items-center gap-4 px-4 min-[901px]:gap-8 min-[901px]:px-6">
        <Link
          to="/"
          search={{}}
          onClick={closeMenu}
          className="group/logo flex shrink-0 items-center gap-2.5 text-foreground transition motion-safe:hover:-translate-y-px motion-safe:hover:text-primary"
          aria-label="Task-Flow home"
        >
          <TaskFlowMark className="size-[22px] text-foreground motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover/logo:rotate-180 motion-safe:group-hover/logo:scale-[1.05]" />
          <TaskFlowWordmark size="sm" className="hidden min-[420px]:inline" />
        </Link>

        <div
          className="hidden min-[901px]:flex flex-1 items-center justify-center gap-0.5"
          role="list"
        >
          {LANDING_NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              role="listitem"
              className={[
                "relative rounded-[10px] px-4 py-2 text-[0.84rem] font-medium text-muted-foreground transition-colors duration-200",
                "hover:bg-elevated/80 hover:text-foreground",
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-[10px]",
                "before:bg-gradient-to-br before:from-primary/10 before:to-[oklch(0.55_0.15_250)]/10",
                "before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[3px]",
              ].join(" ")}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="ml-auto hidden min-[769px]:flex shrink-0 items-center gap-2.5">
          <Link
            to="/login"
            search={{ redirect: undefined }}
            className={[
              "rounded-xl border border-border/60 px-4 py-2 text-[0.8rem] font-medium text-muted-foreground transition",
              "bg-elevated/30 backdrop-blur-md hover:border-border hover:bg-elevated/70 hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
            ].join(" ")}
          >
            Sign in
          </Link>
          <Link
            to="/login"
            search={{ redirect: undefined }}
            className={[
              "group/dashcta inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[0.82rem] font-semibold text-primary-foreground transition",
              "border border-[color-mix(in_oklab,var(--primary)_35%,transparent)]",
              "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-glow)] glow-primary",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:brightness-110 motion-safe:active:scale-[0.98]",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
            ].join(" ")}
          >
            Get started
            <ArrowUpRight
              className="size-3.5 motion-safe:transition-transform motion-safe:group-hover/dashcta:-translate-y-px motion-safe:group-hover/dashcta:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <button
          type="button"
          className={[
            "ml-auto flex min-[901px]:hidden flex-col justify-center gap-[5px] rounded-lg p-1.5",
            "hover:bg-elevated/60 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
          ].join(" ")}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span
            className={`block h-0.5 w-[22px] rounded-sm bg-foreground transition motion-safe:duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-[22px] rounded-sm bg-foreground transition motion-safe:duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-[22px] rounded-sm bg-foreground transition motion-safe:duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuOpen ? (
        <div
          className="animate-landing-nav-mobile flex min-[901px]:hidden flex-col gap-1 border-t border-border/50 px-2.5 pb-2.5 pt-2"
          role="menu"
        >
          {LANDING_NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              role="menuitem"
              className="rounded-lg px-3 py-2.5 text-[0.94rem] font-medium text-muted-foreground transition hover:bg-elevated hover:text-foreground"
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/login"
            search={{ redirect: undefined }}
            role="menuitem"
            className="rounded-lg px-3 py-2.5 text-[0.94rem] font-medium text-muted-foreground transition hover:bg-elevated hover:text-foreground"
            onClick={closeMenu}
          >
            Sign in
          </Link>
          <Link
            to="/login"
            search={{ redirect: undefined }}
            role="menuitem"
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-[0.9rem] font-semibold text-primary-foreground hover:brightness-110 motion-safe:active:scale-[0.98]"
            onClick={closeMenu}
          >
            Get started
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : null}
    </nav>
  );
}

function HeroSection() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative overflow-hidden pt-[max(8rem,calc(env(safe-area-inset-top)+6.75rem))] pb-20 sm:pb-24 md:pb-32 md:pt-[calc(env(safe-area-inset-top)+11rem)]"
    >
      {/* Ambient radials */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 size-[900px] rounded-full opacity-[0.07] bg-[var(--primary)] blur-[120px]" />
        <div className="absolute top-20 right-0 size-[700px] rounded-full opacity-[0.04] bg-[oklch(0.65_0.18_250)] blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 size-[600px] rounded-full opacity-[0.04] bg-[oklch(0.7_0.18_290)] blur-[90px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, oklch(0.97 0.005 270) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Spotlight that follows mouse */}
      <div
        ref={spotlightRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at var(--x, 50%) var(--y, 30%), rgba(255,122,0,0.07), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left */}
          <div className="flex-1 max-w-[620px] text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium mb-8">
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                <circle cx="5" cy="5" r="5" fill="currentColor" opacity="0.2" />
                <circle cx="5" cy="5" r="3" fill="currentColor">
                  <animate
                    attributeName="opacity"
                    values="0.3;1;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              Personal task manager
            </div>

            <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-bold tracking-tight leading-[1.08] mb-6">
              <span className="block text-foreground">Do the work.</span>
              <span className="block bg-gradient-to-r from-[var(--primary)] via-[var(--primary-glow)] to-[oklch(0.82_0.14_65)] bg-clip-text text-transparent">
                Skip the chaos.
              </span>
            </h1>

            <p className="text-[1.0625rem] text-muted-foreground leading-[1.75] mb-8 max-w-[500px] mx-auto lg:mx-0">
              Task-Flow is a focused, personal task manager with smart views, color tags, and a
              real-time momentum ring — built for people who actually want to finish things.
            </p>

            {/* Trust pills */}
            <div
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
              aria-label="Key properties"
            >
              {[
                { icon: CheckCircle2, text: "Today & Upcoming views" },
                { icon: Flame, text: "Daily streak tracking" },
                { icon: Tag, text: "Color tags & filters" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
                >
                  <Icon className="size-3.5 text-[var(--primary)]" aria-hidden />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium text-sm hover:brightness-110 transition glow-primary active:scale-[0.97]"
              >
                <Sparkles className="size-4" aria-hidden />
                Start for free
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-elevated transition active:scale-[0.97]"
              >
                See how it works
                <ArrowRight className="size-3.5" aria-hidden />
              </a>
            </div>
          </div>

          {/* Right — mock dashboard card */}
          <div className="flex-1 w-full max-w-[520px]" aria-hidden>
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

function MockDashboard() {
  const tasks = [
    {
      title: "Review design tokens",
      status: "COMPLETED",
      priority: "HIGH",
      tag: "design",
      due: "Today",
    },
    {
      title: "Ship auth middleware",
      status: "IN_PROGRESS",
      priority: "HIGH",
      tag: "backend",
      due: "Today",
    },
    {
      title: "Write unit tests",
      status: "PENDING",
      priority: "MEDIUM",
      tag: "tests",
      due: "Tomorrow",
    },
    { title: "Update README docs", status: "PENDING", priority: "LOW", tag: "docs", due: "Fri" },
  ];

  const priorityColors: Record<string, string> = {
    HIGH: "text-[oklch(0.7_0.18_22)]",
    MEDIUM: "text-[var(--warning)]",
    LOW: "text-muted-foreground",
  };

  const tagColors: Record<string, string> = {
    design: "bg-[oklch(0.65_0.18_290)]/15 text-[oklch(0.75_0.15_290)]",
    backend: "bg-[var(--primary)]/10 text-[var(--primary)]",
    tests: "bg-[oklch(0.7_0.16_155)]/10 text-[oklch(0.78_0.18_155)]",
    docs: "bg-[oklch(0.65_0.18_250)]/10 text-[oklch(0.72_0.14_250)]",
  };

  return (
    <div className="relative rounded-3xl border border-border bg-card shadow-[0_32px_80px_rgba(0,0,0,0.55)] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-sidebar/60">
        <span className="size-3 rounded-full bg-[oklch(0.65_0.18_22)]/70" />
        <span className="size-3 rounded-full bg-[oklch(0.78_0.13_80)]/70" />
        <span className="size-3 rounded-full bg-[oklch(0.78_0.18_155)]/70" />
        <span className="ml-3 text-[11px] text-muted-foreground font-mono">
          Task-Flow · All tasks
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-border">
        {[
          { label: "Total", value: "4" },
          { label: "Due today", value: "2" },
          { label: "Streak", value: "3 🔥" },
        ].map((s) => (
          <div key={s.label} className="bg-card px-4 py-3">
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className="text-lg font-semibold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <ul className="divide-y divide-border/60">
        {tasks.map((t) => (
          <li
            key={t.title}
            className="flex items-center gap-3 px-4 py-3 hover:bg-elevated/40 transition group"
          >
            <span
              className={`size-4 shrink-0 rounded-full border-2 ${t.status === "COMPLETED" ? "bg-[var(--primary)] border-[var(--primary)]" : t.status === "IN_PROGRESS" ? "border-[var(--primary)] bg-[var(--primary)]/20" : "border-border bg-transparent"}`}
            />
            <span
              className={`flex-1 text-[13px] font-medium truncate ${t.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}
            >
              {t.title}
            </span>
            <span className={`text-[11px] font-medium ${priorityColors[t.priority]}`}>
              {t.priority}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${tagColors[t.tag]}`}>
              {t.tag}
            </span>
            <span className="text-[11px] text-muted-foreground shrink-0">{t.due}</span>
          </li>
        ))}
      </ul>

      {/* Momentum ring */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-border bg-sidebar/40">
        <svg viewBox="0 0 44 44" className="size-9 -rotate-90 shrink-0" aria-hidden>
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--elevated)" strokeWidth="4" />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * 0.5}`}
            style={{ filter: "drop-shadow(0 0 6px rgba(255,122,0,0.5))" }}
          />
        </svg>
        <div>
          <div className="text-[11px] text-muted-foreground">Today's progress</div>
          <div className="text-[13px] font-semibold">1/2 due today done</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[12px] font-medium text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-lg border border-[var(--primary)]/20">
          <Flame className="size-3" aria-hidden />3 day streak
        </div>
      </div>

      {/* Glow overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background: "radial-gradient(circle at 70% 0%, rgba(255,122,0,0.07), transparent 60%)",
        }}
      />
    </div>
  );
}

function PainSection() {
  return (
    <section id="why" aria-labelledby="pain-heading" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-[640px] mb-16">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--primary)] mb-4">
            <span className="size-1.5 rounded-full bg-[var(--primary)] inline-block" aria-hidden />
            The problem
          </div>
          <h2
            id="pain-heading"
            className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight leading-[1.2] mb-5"
          >
            You're not disorganised.{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-glow)] bg-clip-text text-transparent">
              Your tools are.
            </span>
          </h2>
          <p className="text-muted-foreground text-[1.0625rem] leading-[1.75]">
            Most productivity apps are built for teams, for managers, for process — not for one
            person who just wants to finish their list.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-5">
          {PAIN.map((card, idx) => (
            <article
              key={card.id}
              className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden group hover:border-[var(--primary)]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="size-6 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 grid place-items-center">
                  <Clock className="size-3 text-[var(--primary)]" aria-hidden />
                </span>
              </div>
              <h3 className="text-[15px] font-semibold mb-2">{card.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.65]">{card.body}</p>
              {/* bottom accent */}
              <div
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/40 to-[var(--primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);

  const display = hovered !== null ? hovered : active;
  const step = HOW_STEPS[display]!;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % HOW_STEPS.length);
      setBarKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="py-24 md:py-32 bg-sidebar/20 border-y border-border"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-[580px] mb-14">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--primary)] mb-4">
            <span className="size-1.5 rounded-full bg-[var(--primary)] inline-block" aria-hidden />
            How it works
          </div>
          <h2
            id="how-heading"
            className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight leading-[1.2] mb-5"
          >
            Capture. Organise. Ship.
          </h2>
          <p className="text-muted-foreground text-[1.0625rem] leading-[1.75]">
            Three simple actions. One calm dashboard. No configuration required to get started.
          </p>
        </header>

        <div
          className="rounded-2xl border border-border bg-card overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            setHovered(null);
          }}
        >
          {/* Tab row */}
          <div
            className="flex border-b border-border"
            role="tablist"
            aria-label="How Task-Flow works"
          >
            {HOW_STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === display}
                aria-controls={`how-panel-${s.id}`}
                onClick={() => {
                  setActive(i);
                  setHovered(null);
                  setBarKey((k) => k + 1);
                }}
                onMouseEnter={() => setHovered(i)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-[13px] font-medium transition-all border-b-2 ${
                  i === display
                    ? "border-[var(--primary)] text-foreground bg-elevated/30"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-elevated/20"
                }`}
              >
                <span
                  className={`size-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ${i === display ? "bg-[var(--primary)] text-white" : "bg-elevated text-muted-foreground"}`}
                >
                  {s.num.replace("0", "")}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
            <div id={`how-panel-${step.id}`} role="tabpanel" className="p-8">
              <div className="text-[11px] font-mono text-[var(--primary)] mb-3">{step.num}</div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-[14px] leading-[1.7]">{step.body}</p>
            </div>

            {/* Terminal preview */}
            <div className="p-6 bg-[oklch(0.11_0.005_270)] font-mono text-[13px]" aria-hidden>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <span className="size-2.5 rounded-full bg-[oklch(0.65_0.18_22)]/80" />
                <span className="size-2.5 rounded-full bg-[oklch(0.78_0.13_80)]/80" />
                <span className="size-2.5 rounded-full bg-[oklch(0.78_0.18_155)]/80" />
                <span className="ml-2 text-[10px] text-muted-foreground">
                  task-flow · {step.title.toLowerCase()}
                </span>
              </div>
              <div className="space-y-2">
                {step.preview.map((line, i) => (
                  <div
                    key={String(i)}
                    className={`${
                      line.startsWith("$")
                        ? "text-muted-foreground"
                        : line.startsWith(">")
                          ? "text-foreground/80"
                          : line.startsWith("→")
                            ? "text-[var(--warning)]"
                            : "text-[var(--primary)]"
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {line}
                  </div>
                ))}
                <div className="inline-block w-2 h-4 bg-[var(--primary)] animate-pulse mt-1" />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-border" aria-hidden>
            <div
              key={barKey}
              className={`h-full bg-[var(--primary)] origin-left ${paused ? "" : "animate-[progress_4s_linear_forwards]"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const doubled = [...FEATURES, ...FEATURES];

  return (
    <section id="features" aria-labelledby="features-heading" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-14">
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--primary)] mb-4">
          <span className="size-1.5 rounded-full bg-[var(--primary)] inline-block" aria-hidden />
          Capabilities
        </div>
        <h2
          id="features-heading"
          className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight leading-[1.2] mb-4"
        >
          Everything you need, nothing you don't.
        </h2>
        <p className="text-muted-foreground text-[1.0625rem] leading-[1.75] max-w-[560px]">
          No bloat. No team features. No subscriptions. A sharp personal task manager built for
          clarity.
        </p>
      </div>

      {/* Marquee — CSS animation, hover pauses */}
      <div
        className="relative overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg,transparent,black 8%,black 92%,transparent)" }}
        aria-label="Feature cards"
        title="Hover to pause"
      >
        <div
          className="flex gap-4 w-max hover:[animation-play-state:paused]"
          style={{ animation: "marquee 40s linear infinite" }}
          aria-hidden
        >
          {doubled.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={`${f.id}-${i}`}
                className="w-[280px] shrink-0 rounded-2xl border border-border bg-card p-5 hover:border-[var(--primary)]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="size-9 rounded-xl bg-[var(--primary)]/10 grid place-items-center mb-4 border border-[var(--primary)]/20">
                  <Icon className="size-4 text-[var(--primary)]" aria-hidden />
                </div>
                <h3 className="text-[14px] font-semibold mb-1.5">{f.title}</h3>
                <p className="text-[12.5px] text-muted-foreground leading-[1.6] mb-3">{f.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-elevated border border-border text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SR-only list */}
      <ul className="sr-only">
        {FEATURES.map((f) => (
          <li key={f.id}>
            <strong>{f.title}</strong>: {f.body}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CtaSection() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="py-24 md:py-32 border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-[var(--primary)]/25 bg-card overflow-hidden px-8 py-16 md:px-16 text-center">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(255,122,0,0.12), transparent 65%)",
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--primary)] mb-6">
              <Star className="size-3.5" aria-hidden />
              Free forever · No sign-up friction
            </div>

            <h2
              id="cta-heading"
              className="text-[clamp(2rem,5vw,3.25rem)] font-bold tracking-tight leading-[1.1] mb-6"
            >
              Ready to clear{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--primary-glow)] to-[oklch(0.82_0.14_65)] bg-clip-text text-transparent">
                the deck?
              </span>
            </h2>

            <p className="text-muted-foreground text-[1.0625rem] leading-[1.75] max-w-[480px] mx-auto mb-10">
              Sign in with Google in one tap. Your tasks, tags, and progress — synced and private.
              No team, no noise.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-[15px] hover:brightness-110 transition glow-primary active:scale-[0.97]"
              >
                <Sparkles className="size-4" aria-hidden />
                Get started — it's free
              </Link>
              <a
                href="#hero"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-[15px] font-medium hover:bg-elevated transition active:scale-[0.97]"
              >
                Back to top
              </a>
            </div>

            {/* Feature bullets */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-10 text-[13px] text-muted-foreground">
              {[
                "Google OAuth",
                "Today + Upcoming views",
                "Tags & filters",
                "Drag-to-reorder",
                "Streak tracking",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-[var(--primary)]" aria-hidden />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <TaskFlowMark className="size-5 text-foreground" />
          <span className="font-mono text-[13px] font-semibold text-foreground tracking-tight">
            Task-<span className="text-primary">Flow</span>
          </span>
          <span className="hidden sm:inline">— personal workspace</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#why" className="hover:text-foreground transition">
            Why
          </a>
          <a href="#features" className="hover:text-foreground transition">
            Features
          </a>
          <Link
            to="/login"
            search={{ redirect: undefined }}
            className="hover:text-foreground transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
