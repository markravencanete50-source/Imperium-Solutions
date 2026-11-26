"use client";

import { getFirebaseAuth } from "@/lib/firebase/client";
import type { AuditEntry, TeamAction, TeamStatus, TeamUser } from "@/lib/team";

// Browser helpers for the team API routes. Every call carries the signed in admin's ID token.

export type TeamList = {
  me: { uid: string; email: string };
  users: TeamUser[];
  audit: AuditEntry[];
  emailConfigured: boolean;
};

/** The link comes back only when no email went out, so the admin can pass it on by hand. */
export type LinkResult = {
  emailSent: boolean;
  emailError?: "email_not_configured" | "send_failed";
  link?: string;
};

export type InviteResult = LinkResult & { ok: true; user: TeamUser; restored?: boolean };
export type ActionResult = Partial<LinkResult> & { ok: true; user: TeamUser };

/** Thrown for an invite that matches an existing account, so the page can offer to restore it. */
export class EmailExistsError extends Error {
  readonly status: TeamStatus;
  readonly canRestore: boolean;
  constructor(status: TeamStatus, canRestore: boolean) {
    super(
      canRestore
        ? "That email already has an account whose admin access was removed."
        : `That email is already on the team (${status}).`
    );
    this.name = "EmailExistsError";
    this.status = status;
    this.canRestore = canRestore;
  }
}

const MESSAGES: Record<string, string> = {
  unauthorized: "your session has expired, sign in again",
  forbidden: "you do not have admin access",
  not_configured: "the server is not connected to Firebase",
  invalid_fields: "check the name and email",
  invalid_email: "that email address is not valid",
  email_exists: "that email already has an account",
  user_not_found: "that user no longer exists",
  cannot_modify_self: "you cannot block or revoke your own account",
  last_admin: "this would leave no active admin, so it was refused",
  not_allowed: "that action does not apply to this user right now",
  auth_service_error: "Firebase Auth did not accept the request, try again in a moment",
  server_error: "something went wrong on the server",
};

async function request<T>(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<T> {
  const current = getFirebaseAuth().currentUser;
  if (!current) throw new Error("you are signed out");
  const token = await current.getIdToken();
  const res = await fetch(path, {
    method: init.method,
    headers: { authorization: `Bearer ${token}`, ...(init.body === undefined ? {} : { "content-type": "application/json" }) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; status?: TeamStatus };
  if (!res.ok) {
    if (data.error === "email_exists_revoked") throw new EmailExistsError("revoked", true);
    if (data.error === "email_exists" && data.status) throw new EmailExistsError(data.status, false);
    throw new Error(MESSAGES[data.error || ""] || `request failed (${res.status})`);
  }
  return data as T;
}

export const loadTeam = () => request<TeamList>("/api/admin/team", { method: "GET" });

export const inviteMember = (input: { name: string; email: string; restore?: boolean }) =>
  request<InviteResult>("/api/admin/team/invite", { method: "POST", body: input });

export const runTeamAction = (uid: string, action: TeamAction) =>
  request<ActionResult>("/api/admin/team/action", { method: "POST", body: { uid, action } });
