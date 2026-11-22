import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { site } from "@/lib/content";
import { generatePasswordLink, getUserByUid, listUsers, setAdminClaim, updateUser, type AuthUser } from "@/lib/server/authAdmin";
import { authErrorResponse, authorizeAdmin, toTeamUser, writeAudit } from "@/lib/server/adminRoute";
import { sendEmail } from "@/lib/server/email";
import { adminInviteEmail, adminResetEmail } from "@/lib/server/emailTemplates";
import { checkSafety, deriveStatus, TEAM_ACTIONS } from "@/lib/team";

const actionSchema = z.object({
  uid: z.string().trim().min(1).max(128),
  action: z.enum(TEAM_ACTIONS),
});

const SAFETY_STATUS = { cannot_modify_self: 400, last_admin: 409, not_allowed: 409 } as const;

async function emailLink(user: AuthUser, action: "reset_password" | "resend_invite") {
  const loginUrl = `${site.url.replace(/\/+$/, "")}/admin/login`;
  const link = await generatePasswordLink(user.email, loginUrl);
  const data = { name: user.displayName, link, loginUrl };
  const rendered = action === "resend_invite" ? adminInviteEmail(data) : adminResetEmail(data);
  const sent = await sendEmail({ to: user.email, subject: rendered.subject, html: rendered.html, text: rendered.text });
  if (sent.ok) return { emailSent: true as const };
  if (sent.error !== "not_configured") console.error("team email failed", action, sent.error);
  return {
    emailSent: false as const,
    emailError: sent.error === "not_configured" ? "email_not_configured" : "send_failed",
    link,
  };
}

// Admin only: block, unblock, revoke, restore, reset password, resend invite.
export async function POST(request: NextRequest) {
  const auth = await authorizeAdmin(request);
  if ("response" in auth) return auth.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_fields", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { uid, action } = parsed.data;

  try {
    const target = await getUserByUid(uid);
    if (!target) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    const all = (await listUsers()).map((u) => ({ uid: u.uid, status: deriveStatus(u) }));
    const refused = checkSafety(all, { uid: target.uid, status: deriveStatus(target) }, action, auth.caller.uid);
    if (refused) return NextResponse.json({ error: refused }, { status: SAFETY_STATUS[refused] });

    let user: AuthUser = target;
    let extra: Record<string, unknown> = {};
    if (action === "block") user = await updateUser(uid, { disabled: true, revokeSessions: true });
    else if (action === "unblock") user = await updateUser(uid, { disabled: false });
    else if (action === "revoke") user = await setAdminClaim(target, false, { revokeSessions: true });
    else if (action === "restore") user = await setAdminClaim(target, true);
    else extra = await emailLink(target, action);

    await writeAudit({ action, targetEmail: user.email, targetUid: user.uid, by: auth.caller.email });
    return NextResponse.json({ ok: true, user: toTeamUser(user), ...extra });
  } catch (err) {
    return authErrorResponse(err, "team action failed");
  }
}
