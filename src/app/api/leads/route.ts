import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, NotConfiguredError } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/crm";
import { leadSchema } from "@/lib/validation";
import { notify, verifyTurnstile } from "@/lib/server/guards";

// Estimate requests from the public contact form.
export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_fields", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot filled: pretend it worked and store nothing.
  if (input.website) return NextResponse.json({ ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return NextResponse.json({ error: "spam_check_failed" }, { status: 400 });
  }

  try {
    const ref = await getAdminDb()
      .collection(COLLECTIONS.leads)
      .add({
        type: "estimate",
        name: input.name,
        email: input.email,
        company: input.company,
        need: input.need,
        side: input.side,
        coverage: input.coverage,
        teamSize: input.teamSize,
        startDate: input.startDate || "",
        status: "new",
        temperature: "unrated",
        source: "website",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    await notify("lead.created", {
      leadId: ref.id,
      type: "estimate",
      name: input.name,
      email: input.email,
      company: input.company,
      need: input.need,
      side: input.side,
      coverage: input.coverage,
      teamSize: input.teamSize,
      startDate: input.startDate || "",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("lead create failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
