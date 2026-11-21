import { after, NextResponse, type NextRequest } from "next/server";
import { FieldValue, Timestamp, type DocumentReference } from "firebase-admin/firestore";
import { getAdminDb, NotConfiguredError } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/crm";
import { bookingSchema } from "@/lib/validation";
import { getAvailability, overlaps, slotId } from "@/lib/server/availability";
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
    // Server side check that this exact slot exists and is open right now.
    const { settings, open } = await getAvailability(new Date(), { from: slot, to: new Date(slot.getTime() + 1) });
    if (!open.some((s) => s.getTime() === slot.getTime())) {
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
    // Bookings that start at a neighbouring slot can still overlap when a call is longer than the step.
    const reach = settings.allDay ? Math.ceil(settings.durationMinutes / settings.slotStepMinutes) - 1 : 0;
    const neighbours: DocumentReference[] = [];
    for (let j = -reach; j <= reach; j++) {
      if (j !== 0) neighbours.push(db.collection(COLLECTIONS.bookings).doc(slotId(new Date(slot.getTime() + j * settings.slotStepMinutes * 60000))));
    }
    const answers = {
      company: input.company,
      industry: input.industry,
      needs: input.needs,
      budget: input.budget,
      notes: input.notes,
    };
    const summary = [
      `Consultation booked for ${when}.`,
      `Needs: ${input.needs.join(", ")}.`,
      `Budget: ${input.budget}.`,
      `Industry: ${input.industry}.`,
    ].join(" ");

    try {
      await db.runTransaction(async (tx) => {
        // A cancelled booking keeps its document, so a free slot may already have one: reuse it.
        // The read and write on the same document keep two concurrent requests from both succeeding.
        const existing = await tx.get(bookingRef);
        if (existing.exists && existing.data()?.status !== "cancelled") throw new SlotTakenError();
        if (neighbours.length) {
          for (const n of await tx.getAll(...neighbours)) {
            const b = n.data();
            if (!n.exists || !b || b.status === "cancelled" || !b.slotStart) continue;
            const minutes = Number(b.durationMinutes) > 0 ? Number(b.durationMinutes) : settings.durationMinutes;
            if (overlaps(slot.getTime(), settings.durationMinutes, (b.slotStart as Timestamp).toMillis(), minutes)) {
              throw new SlotTakenError();
            }
          }
        }
        tx.set(bookingRef, {
          slotStart: Timestamp.fromDate(slot),
          durationMinutes: settings.durationMinutes,
          name: input.name,
          email: input.email,
          ...answers,
          visitorTimezone: input.visitorTimezone,
          status: "booked",
          leadId: leadRef.id,
          createdAt: FieldValue.serverTimestamp(),
        });
        tx.create(leadRef, {
          type: "consultation",
          name: input.name,
          email: input.email,
          ...answers,
          need: summary,
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
      ...answers,
    });

    after(() =>
      Promise.allSettled([
        sendBookingEmails({
          leadId: leadRef.id,
          bookingId: bookingRef.id,
          name: input.name,
          email: input.email,
          ...answers,
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
