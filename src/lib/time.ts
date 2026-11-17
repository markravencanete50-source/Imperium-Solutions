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

export function zoneParts(zone: string, date: Date): ZoneParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
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
