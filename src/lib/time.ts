// Time zone helpers built on Intl only, so they run the same on server and client.

export type ZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 0 Sunday to 6 Saturday
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(zone: string): Intl.DateTimeFormat {
  let f = partsFormatters.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsFormatters.set(zone, f);
  }
  return f;
}

export function zoneParts(zone: string, date: Date): ZoneParts {
  const parts = partsFormatter(zone).formatToParts(date);
  const o: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") o[p.type] = p.value;
  return {
    year: +o.year,
    month: +o.month,
    day: +o.day,
    hour: +o.hour,
    minute: +o.minute,
    second: +o.second,
    weekday: WEEKDAYS.indexOf(o.weekday),
  };
}

/** Minutes the zone is ahead of UTC at the given instant. */
export function zoneOffsetMinutes(zone: string, date: Date): number {
  const o = zoneParts(zone, date);
  const asUtc = Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** The instant at which a wall clock time occurs in a zone. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  zone: string
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let utc = guess - zoneOffsetMinutes(zone, new Date(guess)) * 60000;
  // Second pass settles times near a daylight saving change.
  utc = guess - zoneOffsetMinutes(zone, new Date(utc)) * 60000;
  return new Date(utc);
}

export function isValidZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export function formatHour(h: number): string {
  const n = ((h % 24) + 24) % 24;
  const hr = Math.floor(n);
  const min = Math.round((n - hr) * 60);
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${h12}:${min < 10 ? "0" : ""}${min} ${hr < 12 ? "am" : "pm"}`;
}

// ----- Calendar days in a zone -----
// A "date key" is YYYY-MM-DD. These helpers keep day boundaries in a chosen zone,
// so a visitor in Manila sees their own midnight to midnight days.

export const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function dateKey(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** The calendar day an instant falls on in a zone. */
export function dateKeyInZone(zone: string, date: Date): string {
  const p = zoneParts(zone, date);
  return dateKey(p.year, p.month, p.day);
}

/** Splits a valid date key into numbers, or returns null when it is not a real calendar day. */
export function parseDateKey(key: string): { year: number; month: number; day: number } | null {
  if (!DATE_KEY.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return { year, month, day };
}

/** Moves a date key by whole calendar days. */
export function addDaysToKey(key: string, days: number): string {
  const p = parseDateKey(key);
  if (!p) return key;
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return dateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** The instant a calendar day starts in a zone (local midnight). */
export function startOfZonedDay(key: string, zone: string): Date {
  const p = parseDateKey(key);
  if (!p) return new Date(NaN);
  return zonedTimeToUtc(p.year, p.month, p.day, 0, 0, zone);
}
