import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, DEFAULT_BOOKING_SETTINGS, type BookingSettings } from "@/lib/crm";
import { isValidZone, zoneParts, zonedTimeToUtc } from "@/lib/time";

export async function getBookingSettings(): Promise<BookingSettings> {
  const snap = await getAdminDb().collection(COLLECTIONS.settings).doc("booking").get();
  const data = (snap.exists ? snap.data() : {}) as Partial<BookingSettings>;
  const merged = { ...DEFAULT_BOOKING_SETTINGS, ...data };
  if (!isValidZone(merged.timezone)) merged.timezone = DEFAULT_BOOKING_SETTINGS.timezone;
  merged.times = (merged.times || []).filter((t) => /^\d{2}:\d{2}$/.test(t));
  merged.daysAhead = Math.min(Math.max(Number(merged.daysAhead) || 10, 1), 30);
  return merged;
}

/** Every slot the settings allow from now, as UTC instants, before removing booked ones. */
export function generateSlots(settings: BookingSettings, now: Date): Date[] {
  const earliest = now.getTime() + settings.minNoticeHours * 3600000;
  const today = zoneParts(settings.timezone, now);
  const out: Date[] = [];
  let businessDays = 0;

  for (let i = 0; i < 60 && businessDays < settings.daysAhead; i++) {
    // Walk calendar days in UTC arithmetic, then read the weekday back in the zone.
    const cursor = new Date(Date.UTC(today.year, today.month - 1, today.day + i, 12, 0, 0));
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth() + 1;
    const d = cursor.getUTCDate();
    const weekday = cursor.getUTCDay();
    if (!settings.weekdays.includes(weekday)) continue;

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

export async function getOpenSlots(now: Date): Promise<{ settings: BookingSettings; slots: Date[] }> {
  const settings = await getBookingSettings();
  const all = generateSlots(settings, now);
  const taken = new Set<number>();
  const snap = await getAdminDb()
    .collection(COLLECTIONS.bookings)
    .where("slotStart", ">=", Timestamp.fromDate(now))
    .get();
  snap.forEach((doc) => {
    const b = doc.data();
    if (b.status !== "cancelled" && b.slotStart) taken.add((b.slotStart as Timestamp).toMillis());
  });
  return { settings, slots: all.filter((s) => !taken.has(s.getTime())) };
}

export function slotId(slot: Date): string {
  return slot.toISOString().replace(/[-:.]/g, "");
}
