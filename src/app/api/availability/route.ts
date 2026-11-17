import { NextResponse, connection } from "next/server";
import { NotConfiguredError } from "@/lib/firebase/admin";
import { getOpenSlots } from "@/lib/server/availability";

// Open consultation slots as UTC instants. The browser shows them in the visitor's time zone.
export async function GET() {
  await connection(); // always computed at request time
  try {
    const { settings, slots } = await getOpenSlots(new Date());
    return NextResponse.json(
      { durationMinutes: settings.durationMinutes, slots: slots.map((s) => s.toISOString()) },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (err) {
    if (err instanceof NotConfiguredError) {
      return NextResponse.json({ error: "not_configured", slots: [] }, { status: 503 });
    }
    console.error("availability failed", err);
    return NextResponse.json({ error: "server_error", slots: [] }, { status: 500 });
  }
}
