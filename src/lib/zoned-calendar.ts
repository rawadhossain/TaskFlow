import { utcAddDays, utcStartOfCalendarDayUtc } from "@/lib/api-response";

function pad2(n: number): string {
  return String(Math.trunc(n)).padStart(2, "0");
}

function isoYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function gregorianPartsInTimeZone(
  reference: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = dtf.formatToParts(reference);
  const pick = (t: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === t)?.value ?? "";
  return {
    year: Number(pick("year")),
    month: Number(pick("month")),
    day: Number(pick("day")),
  };
}

function ymdInTimeZoneUtcMillis(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

export function utcMillisStartOfZonedCalendarDay(
  year: number,
  month: number,
  day: number,
  timeZone: string,
): number {
  const target = isoYmd(year, month, day);
  let lo = Date.UTC(year, month - 1, day) - 48 * 86_400_000;
  let hi = Date.UTC(year, month - 1, day + 1) + 48 * 86_400_000;
  while (lo < hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    if (ymdInTimeZoneUtcMillis(mid, timeZone) < target) lo = mid + 1;
    else hi = mid;
  }
  if (ymdInTimeZoneUtcMillis(lo, timeZone) === target) return lo;

  for (let t = lo - 48 * 86_400_000; t <= lo + 48 * 86_400_000; t += 60_000) {
    if (ymdInTimeZoneUtcMillis(t, timeZone) === target) return t;
  }

  throw new Error(`Unable to resolve zoned midnight for ${target} in ${timeZone}`);
}

export function gregorianAddDays(
  year: number,
  month: number,
  day: number,
  deltaDays: number,
): {
  year: number;
  month: number;
  day: number;
} {
  const u = Date.UTC(year, month - 1, day + deltaDays);
  const dt = new Date(u);
  return {
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
  };
}

export function zonedCalendarDayUtcBounds(
  reference: Date,
  timeZone: string,
): { start: Date; end: Date } {
  const { year, month, day } = gregorianPartsInTimeZone(reference, timeZone);
  const startMs = utcMillisStartOfZonedCalendarDay(year, month, day, timeZone);
  const tomorrow = gregorianAddDays(year, month, day, 1);
  const endMs = utcMillisStartOfZonedCalendarDay(
    tomorrow.year,
    tomorrow.month,
    tomorrow.day,
    timeZone,
  );
  return { start: new Date(startMs), end: new Date(endMs) };
}

export type EffectiveDayBounds = {
  /** Start (inclusive) of "today" in the effective calendar. */
  todayStart: Date;
  tomorrowStart: Date;
  /** Exclusive upper bound ("today + 8 local days"). */
  weekEndExclusive: Date;
};

export function getEffectiveDueDateBounds(reference: Date, timeZone?: string): EffectiveDayBounds {
  if (!timeZone?.trim()) {
    const todayStart = utcStartOfCalendarDayUtc(reference);
    const tomorrowStart = utcAddDays(todayStart, 1);
    const weekEndExclusive = utcAddDays(todayStart, 8);
    return { todayStart, tomorrowStart, weekEndExclusive };
  }

  const tz = timeZone.trim();
  const { start: todayStart, end: tomorrowStart } = zonedCalendarDayUtcBounds(reference, tz);
  const { year, month, day } = gregorianPartsInTimeZone(reference, tz);
  const eighthExclusive = gregorianAddDays(year, month, day, 8);
  const weekEndExclusiveUtc = utcMillisStartOfZonedCalendarDay(
    eighthExclusive.year,
    eighthExclusive.month,
    eighthExclusive.day,
    tz,
  );
  return {
    todayStart,
    tomorrowStart,
    weekEndExclusive: new Date(weekEndExclusiveUtc),
  };
}
