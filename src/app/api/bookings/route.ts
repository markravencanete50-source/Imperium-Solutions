import { after, NextResponse, type NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb, NotConfiguredError } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/crm";
import { bookingSchema } from "@/lib/validation";
import { getOpenSlots, slotId } from "@/lib/server/availability";
import { notify, verifyTurnstile } from "@/lib/server/guards";
import { sendBookingEmails } from "@/lib/server/outbound";

class SlotTakenError extends Error {}

// Books a 15 minute consultation and creates the matching lead.
export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_fields", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;
  if (input.website) return NextResponse.json({ ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return NextResponse.json({ error: "spam_check_failed" }, { status: 400 });
  }

  try {
    const slot = new Date(input.slot);
    const { settings, slots } = await getOpenSlots(new Date());
    if (!slots.some((s) => s.getTime() === slot.getTime())) {
      return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
    }

    const db = getAdminDb();
    const leadRef = db.collection(COLLECTIONS.leads).doc();
    // The slot is the document id, so two people cannot hold the same time.
    const bookingRef = db.collection(COLLECTIONS.bookings).doc(slotId(slot));
    const when = slot.toLocaleString("en-US", {
      timeZone: settings.timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

    try {
      await db.runTransaction(async (tx) => {
        // A cancelled booking keeps its document, so a free slot may already have one: reuse it.
        // The read and write on the same document keep two concurrent requests from both succeeding.
        const existing = await tx.get(bookingRef);
        if (existing.exists && existing.data()?.status !== "cancelled") throw new SlotTakenError();
        tx.set(bookingRef, {
          slotStart: Timestamp.fromDate(slot),
          durationMinutes: settings.durationMinutes,
          name: input.name,
          email: input.email,
          visitorTimezone: input.visitorTimezone,
          status: "booked",
          leadId: leadRef.id,
          createdAt: FieldValue.serverTimestamp(),
        });
        tx.create(leadRef, {
          type: "consultation",
          name: input.name,
          email: input.email,
          company: "",
          need: `Consultation booked for ${when}.`,
          status: "new",
          temperature: "unrated",
          source: "website",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
    } catch (err) {
      if (err instanceof SlotTakenError) {
        return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
      }
      throw err;
    }

    await notify("booking.created", {
      leadId: leadRef.id,
      bookingId: bookingRef.id,
      name: input.name,
      email: input.email,
      slot: slot.toISOString(),
      when,
      visitorTimezone: input.visitorTimezone,
    });

    after(() =>
      Promise.allSettled([
        sendBookingEmails({
          leadId: leadRef.id,
          bookingId: bookingRef.id,
          name: input.name,
          email: input.email,
          slot,
          visitorTimezone: input.visitorTimezone,
          settingsTimezone: settings.timezone,
          durationMinutes: settings.durationMinutes,
        }),
      ])
    );

    return NextResponse.json({ ok: true, slot: slot.toISOString() });
  } catch (err) {
    if (err instanceof NotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("booking failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
