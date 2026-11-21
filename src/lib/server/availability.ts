import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, DEFAULT_BOOKING_SETTINGS, MAX_DAYS_AHEAD, type BookingSettings } from "@/lib/crm";
import { addDaysToKey, dateKeyInZone, isValidZone, startOfZonedDay, zoneParts, zonedTimeToUtc } from "@/lib/time";

const MINUTE = 60000;
const HOUR = 3600000;
// A booking can start this long before a slot and still overlap it (call length is capped at 120 minutes).
const MAX_OVERLAP_LOOKBACK = 2 * HOUR;

export async function getBookingSettings(): Promise<BookingSettings> {
  const snap = await getAdminDb().collection(COLLECTIONS.settings).doc("booking").get();
  const data = (snap.exists ? snap.data() : {}) as Partial<BookingSettings>;
  const merged = { ...DEFAULT_BOOKING_SETTINGS, ...data };
  if (!isValidZone(merged.timezone)) merged.timezone = DEFAULT_BOOKING_SETTINGS.timezone;
  merged.allDay = merged.allDay !== false;
  merged.weekdays = Array.isArray(merged.weekdays) ? merged.weekdays : DEFAULT_BOOKING_SETTINGS.weekdays;
  merged.times = (merged.times || []).filter((t) => /^\d{2}:\d{2}$/.test(t));
  merged.daysAhead = Math.min(Math.max(Math.round(Number(merged.daysAhead)) || DEFAULT_BOOKING_SETTINGS.daysAhead, 1), MAX_DAYS_AHEAD);
  merged.durationMinutes = Math.min(Math.max(Number(merged.durationMinutes) || DEFAULT_BOOKING_SETTINGS.durationMinutes, 5), 120);
  merged.slotStepMinutes = Math.min(Math.max(Math.round(Number(merged.slotStepMinutes)) || DEFAULT_BOOKING_SETTINGS.slotStepMinutes, 5), 120);
  const notice = Number(merged.minNoticeHours);
  merged.minNoticeHours = Number.isFinite(notice) ? Math.min(Math.max(notice, 0), 720) : DEFAULT_BOOKING_SETTINGS.minNoticeHours;
  return merged;
}

export type SlotRange = { from: Date; to: Date }; // from is inclusive, to is exclusive

/** The instant after which nothing can be booked. */
export function bookingHorizon(settings: BookingSettings, now: Date): Date {
  if (settings.allDay) {
    // daysAhead whole calendar days, counting today, in the settings zone.
    const today = dateKeyInZone(settings.timezone, now);
    return startOfZonedDay(addDaysToKey(today, settings.daysAhead), settings.timezone);
  }
  const all = generateWeeklySlots(settings, now);
  return new Date((all.length ? all[all.length - 1].getTime() : now.getTime()) + 1);
}

/** Open hours mode: the configured weekdays and start times, for the next `daysAhead` business days. */
function generateWeeklySlots(settings: BookingSettings, now: Date): Date[] {
  const earliest = now.getTime() + settings.minNoticeHours * HOUR;
  const today = zoneParts(settings.timezone, now);
  const out: Date[] = [];
  let businessDays = 0;

  for (let i = 0; i < 130 && businessDays < settings.daysAhead; i++) {
    // Walk calendar days in UTC arithmetic, then read the weekday back in the zone.
    const cursor = new Date(Date.UTC(today.year, today.month - 1, today.day + i, 12, 0, 0));
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth() + 1;
    const d = cursor.getUTCDate();
    if (!settings.weekdays.includes(cursor.getUTCDay())) continue;

    let added = false;
    for (const t of settings.times) {
      const [hh, mm] = t.split(":").map(Number);
      const slot = zonedTimeToUtc(y, m, d, hh, mm, settings.timezone);
      if (slot.getTime() >= earliest) {
        out.push(slot);
        added = true;
      }
    }
    if (added) businessDays++;
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}

/** Round the clock mode: every step minutes of every calendar day in the settings zone. */
function generateAllDaySlots(settings: BookingSettings, now: Date, range?: SlotRange): Date[] {
  const zone = settings.timezone;
  const lo = Math.max(now.getTime() + settings.minNoticeHours * HOUR, range?.from.getTime() ?? -Infinity);
  const hi = Math.min(bookingHorizon(settings, now).getTime(), range?.to.getTime() ?? Infinity);
  const out: Date[] = [];
  if (!(lo < hi)) return out;

  const step = settings.slotStepMinutes * MINUTE;
  let day = dateKeyInZone(zone, new Date(lo));
  // Walk instants, not wall clock times, so a daylight saving day simply has 92 or 100 slots.
  for (let guard = 0; guard < 200; guard++) {
    const start = startOfZonedDay(day, zone).getTime();
    const next = startOfZonedDay(addDaysToKey(day, 1), zone).getTime();
    if (start >= hi) break;
    for (let t = start; t < next; t += step) {
      if (t >= lo && t < hi) out.push(new Date(t));
    }
    day = addDaysToKey(day, 1);
  }
  return out;
}

/** Every slot the settings allow, as UTC instants, before removing booked ones. Optionally limited to a range. */
export function generateSlots(settings: BookingSettings, now: Date, range?: SlotRange): Date[] {
  if (settings.allDay) return generateAllDaySlots(settings, now, range);
  const all = generateWeeklySlots(settings, now);
  return range ? all.filter((s) => s.getTime() >= range.from.getTime() && s.getTime() < range.to.getTime()) : all;
}

export type Availability = {
  settings: BookingSettings;
  /** Slots that can be booked. */
  open: Date[];
  /** Slots that exist but are already held by a booking. */
  taken: Date[];
};

/** Open and taken slots in a range. A slot is taken when an active booking overlaps its time. */
export async function getAvailability(now: Date, range?: SlotRange): Promise<Availability> {
  const settings = await getBookingSettings();
  const grid = generateSlots(settings, now, range);
  if (!grid.length) return { settings, open: [], taken: [] };

  const lo = grid[0].getTime();
  const hi = grid[grid.length - 1].getTime();
  const snap = await getAdminDb()
    .collection(COLLECTIONS.bookings)
    .where("slotStart", ">=", Timestamp.fromMillis(lo - MAX_OVERLAP_LOOKBACK))
    .where("slotStart", "<=", Timestamp.fromMillis(hi))
    .get();
  const held: { start: number; end: number }[] = [];
  snap.forEach((doc) => {
    const b = doc.data();
    if (b.status === "cancelled" || !b.slotStart) return;
    const start = (b.slotStart as Timestamp).toMillis();
    const minutes = Number(b.durationMinutes) > 0 ? Number(b.durationMinutes) : settings.durationMinutes;
    held.push({ start, end: start + minutes * MINUTE });
  });

  const length = settings.durationMinutes * MINUTE;
  const open: Date[] = [];
  const taken: Date[] = [];
  for (const slot of grid) {
    const s = slot.getTime();
    (held.some((h) => s < h.end && h.start < s + length) ? taken : open).push(slot);
  }
  return { settings, open, taken };
}

export function slotId(slot: Date): string {
  return slot.toISOString().replace(/[-:.]/g, "");
}

/** Whether two bookings, given as a start and a length in minutes, share any time. */
export function overlaps(aStart: number, aMinutes: number, bStart: number, bMinutes: number): boolean {
  return aStart < bStart + bMinutes * MINUTE && bStart < aStart + aMinutes * MINUTE;
}
