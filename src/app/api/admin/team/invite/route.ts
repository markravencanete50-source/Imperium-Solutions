import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { site } from "@/lib/content";
import { createUser, generatePasswordLink, getUserByEmail, setAdminClaim } from "@/lib/server/authAdmin";
import { authErrorResponse, authorizeAdmin, toTeamUser, writeAudit } from "@/lib/server/adminRoute";
import { sendEmail } from "@/lib/server/email";
import { adminInviteEmail } from "@/lib/server/emailTemplates";
import { deriveStatus } from "@/lib/team";

const inviteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine((v) => !/[\u0000-\u001f\u007f]/.test(v), "Invalid characters"),
  email: z.string().trim().toLowerCase().email().max(200),
  /** Set when the admin confirms restoring access for an email that already has an account. */
  restore: z.boolean().optional().default(false),
});

// Admin only: creates a user with no password, gives it the admin claim, and emails a password link.
// When email is not configured (or fails) the link comes back in the response so it can be sent by hand.
export async function POST(request: NextRequest) {
  const auth = await authorizeAdmin(request);
  if ("response" in auth) return auth.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = inviteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_fields", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, email, restore } = parsed.data;

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      const status = deriveStatus(existing);
      if (status !== "revoked") {
        return NextResponse.json({ error: "email_exists", status, uid: existing.uid }, { status: 409 });
      }
      if (!restore) {
        return NextResponse.json(
          { error: "email_exists_revoked", status, uid: existing.uid, name: existing.displayName },
          { status: 409 }
        );
      }
      const restored = await setAdminClaim(existing, true);
      await writeAudit({ action: "restore", targetEmail: restored.email, targetUid: restored.uid, by: auth.caller.email });
      return NextResponse.json({ ok: true, restored: true, user: toTeamUser(restored) });
    }

    const created = await createUser({ email, displayName: name });
    const user = await setAdminClaim(created, true);
    await writeAudit({ action: "invite", targetEmail: user.email, targetUid: user.uid, by: auth.caller.email });

    const loginUrl = `${site.url.replace(/\/+$/, "")}/admin/login`;
    const link = await generatePasswordLink(user.email, loginUrl);
    const rendered = adminInviteEmail({ name: user.displayName || name, link, loginUrl });
    const sent = await sendEmail({ to: user.email, subject: rendered.subject, html: rendered.html, text: rendered.text });

    if (sent.ok) return NextResponse.json({ ok: true, user: toTeamUser(user), emailSent: true });
    if (sent.error !== "not_configured") console.error("invite email failed", sent.error);
    return NextResponse.json({
      ok: true,
      user: toTeamUser(user),
      emailSent: false,
      emailError: sent.error === "not_configured" ? "email_not_configured" : "send_failed",
      link,
    });
  } catch (err) {
    return authErrorResponse(err, "team invite failed");
  }
}
