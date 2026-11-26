import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/crm";
import { verifyAdminToken } from "@/lib/server/verifyAdmin";
import { AuthAdminError, type AuthUser } from "@/lib/server/authAdmin";
import { deriveStatus, type AuditAction, type AuditEntry, type TeamUser } from "@/lib/team";

export type AdminCaller = { email: string; uid: string };

/** Checks the Bearer ID token and the admin claim. Returns the caller, or the response to send back. */
export async function authorizeAdmin(request: NextRequest): Promise<{ caller: AdminCaller } | { response: NextResponse }> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const check = await verifyAdminToken(token);
  if (!check.ok) {
    const error = check.status === 403 ? "forbidden" : check.status === 503 ? "not_configured" : "unauthorized";
    return { response: NextResponse.json({ error }, { status: check.status }) };
  }
  return { caller: { email: check.email, uid: check.uid } };
}

export function toTeamUser(u: AuthUser): TeamUser {
  return {
    uid: u.uid,
    email: u.email,
    name: u.displayName,
    status: deriveStatus(u),
    lastSignInAt: u.lastSignInAt,
    createdAt: u.createdAt,
  };
}

/** Maps a failure from the Identity Toolkit layer to a JSON response. */
export function authErrorResponse(err: unknown, context: string): NextResponse {
  if (err instanceof AuthAdminError) {
    console.error(context, err.code, err.detail);
    if (err.code === "NOT_CONFIGURED") return NextResponse.json({ error: "not_configured" }, { status: 503 });
    if (err.code === "EMAIL_EXISTS") return NextResponse.json({ error: "email_exists" }, { status: 409 });
    if (err.code === "USER_NOT_FOUND") return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    if (err.code === "INVALID_EMAIL") return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    return NextResponse.json({ error: "auth_service_error", code: err.code }, { status: 502 });
  }
  console.error(context, err);
  return NextResponse.json({ error: "server_error" }, { status: 500 });
}

/** Writes one audit row. Never throws, so a logging problem cannot undo a user change. */
export async function writeAudit(entry: {
  action: AuditAction;
  targetEmail: string;
  targetUid: string;
  by: string;
}): Promise<void> {
  try {
    await getAdminDb().collection(COLLECTIONS.auditLog).add({ ...entry, at: FieldValue.serverTimestamp() });
  } catch (err) {
    console.error("audit log write failed", entry.action, err);
  }
}

/** The latest audit rows, newest first. Empty when the read fails. */
export async function latestAudit(limit = 20): Promise<AuditEntry[]> {
  try {
    const snap = await getAdminDb().collection(COLLECTIONS.auditLog).orderBy("at", "desc").limit(limit).get();
    return snap.docs.map((d) => {
      const data = d.data();
      const at = data.at as { toMillis?: () => number } | undefined;
      return {
        id: d.id,
        action: data.action as AuditAction,
        targetEmail: String(data.targetEmail || ""),
        targetUid: String(data.targetUid || ""),
        by: String(data.by || ""),
        at: at?.toMillis ? at.toMillis() : null,
      };
    });
  } catch (err) {
    console.error("audit log read failed", err);
    return [];
  }
}
