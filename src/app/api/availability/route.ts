import { NextResponse, connection, type NextRequest } from "next/server";
import { NotConfiguredError } from "@/lib/firebase/admin";
import { bookingHorizon, getAvailability, getBookingSettings } from "@/lib/server/availability";
import { availabilityQuerySchema } from "@/lib/validation";
import { addDaysToKey, dateKeyInZone, parseDateKey, startOfZonedDay } from "@/lib/time";

// Open and taken consultation slots for a window of calendar days in the visitor's time zone.
//
//   GET /api/availability?start=2026-11-24&days=1&tz=Asia/Manila
//   GET /api/availability?start=2026-11-01&days=30&tz=Asia/Manila&summary=1
//
// start defaults to today in tz, days is 1 to 42, tz defaults to the booking time zone.
// With summary=1 only the per day counts come back (used to grey out the calendar). Without it the
// response also lists every open and taken slot as an ISO instant, so the payload stays small for one day.
export async function GET(request: NextRequest) {
  await connection(); // always computed at request time
  const parsed = availabilityQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success || (parsed.data.start && !parseDateKey(parsed.data.start))) {
    return NextResponse.json({ error: "invalid_query", open: [], taken: [] }, { status: 400 });
  }
  const q = parsed.data;

  try {
    const now = new Date();
    const settings = await getBookingSettings();
    const zone = q.tz || settings.timezone;
    const today = dateKeyInZone(zone, now);
    const start = q.start || today;
    const from = startOfZonedDay(start, zone);
    const to = startOfZonedDay(addDaysToKey(start, q.days), zone);

    const { open, taken } = await getAvailability(now, { from, to });

    // Day boundaries in the visitor's zone, so a day's counts match the days they see.
    const summary: Record<string, { open: number; taken: number }> = {};
    for (let i = 0; i < q.days; i++) summary[addDaysToKey(start, i)] = { open: 0, taken: 0 };
    for (const s of open) {
      const k = dateKeyInZone(zone, s);
      if (summary[k]) summary[k].open++;
    }
    for (const s of taken) {
      const k = dateKeyInZone(zone, s);
      if (summary[k]) summary[k].taken++;
    }

    const horizon = bookingHorizon(settings, now);
    const body: Record<string, unknown> = {
      timezone: zone,
      settingsTimezone: settings.timezone,
      durationMinutes: settings.durationMinutes,
      stepMinutes: settings.allDay ? settings.slotStepMinutes : null,
      allDay: settings.allDay,
      today,
      lastDate: dateKeyInZone(zone, new Date(horizon.getTime() - 1)),
      start,
      days: q.days,
      summary,
    };
    if (!q.summary) {
      body.open = open.map((s) => s.toISOString());
      body.taken = taken.map((s) => s.toISOString());
    }
    return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    if (err instanceof NotConfiguredError) {
      return NextResponse.json({ error: "not_configured", open: [], taken: [] }, { status: 503 });
    }
    console.error("availability failed", err);
    return NextResponse.json({ error: "server_error", open: [], taken: [] }, { status: 500 });
  }
}
