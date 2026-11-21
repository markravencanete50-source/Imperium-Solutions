import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminDb, NotConfiguredError } from "@/lib/firebase/admin";
import { verifyAdminToken } from "@/lib/server/verifyAdmin";
import { COLLECTIONS } from "@/lib/crm";
import { emailFrom, isEmailConfigured, sendEmail, teamReplyTo } from "@/lib/server/email";
import { manualEmail } from "@/lib/server/emailTemplates";
import { logEmail } from "@/lib/server/outbound";

const composeSchema = z.object({
  leadId: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
});

// Admin only: sends a hand written email to a lead and logs it on the lead.
export async function POST(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const check = await verifyAdminToken(token);
  if (!check.ok) {
    const error = check.status === 403 ? "forbidden" : check.status === 503 ? "not_configured" : "unauthorized";
    return NextResponse.json({ error }, { status: check.status });
  }
  const adminEmail = check.email;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = composeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_fields", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { leadId, subject, body } = parsed.data;

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  try {
    const leadRef = getAdminDb().collection(COLLECTIONS.leads).doc(leadId);
    const snap = await leadRef.get();
    const to = snap.exists ? String(snap.data()?.email || "") : "";
    if (!snap.exists) return NextResponse.json({ error: "lead_not_found" }, { status: 404 });
    if (!to) return NextResponse.json({ error: "lead_has_no_email" }, { status: 400 });

    const rendered = manualEmail(subject, body);
    const result = await sendEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      replyTo: teamReplyTo(),
    });
    await logEmail({ leadId, kind: "manual", to: [to], rendered, result, by: adminEmail });

    if (!result.ok) {
      console.error("manual email failed", emailFrom(), result.error);
      return NextResponse.json({ error: "send_failed", detail: result.error }, { status: 502 });
    }

    try {
      await leadRef.collection("activities").add({
        text: `Email sent: ${rendered.subject}`,
        by: adminEmail,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("email activity note failed", err);
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    if (err instanceof NotConfiguredError) return NextResponse.json({ error: "not_configured" }, { status: 503 });
    console.error("admin email failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
