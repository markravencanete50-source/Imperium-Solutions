// Shared by the Team page and the admin API routes. No server or browser imports here.

export type TeamStatus = "active" | "invited" | "blocked" | "revoked";

export type TeamUser = {
  uid: string;
  email: string;
  name: string;
  status: TeamStatus;
  /** Milliseconds since the epoch, or null when the user has never signed in. */
  lastSignInAt: number | null;
  createdAt: number | null;
};

export const TEAM_ACTIONS = ["block", "unblock", "revoke", "restore", "reset_password", "resend_invite"] as const;
export type TeamAction = (typeof TEAM_ACTIONS)[number];

export type AuditAction = TeamAction | "invite";

export type AuditEntry = {
  id: string;
  action: AuditAction;
  targetEmail: string;
  targetUid: string;
  by: string;
  /** Milliseconds since the epoch. */
  at: number | null;
};

export const STATUS_LABELS: Record<TeamStatus, string> = {
  active: "Active",
  invited: "Invited",
  blocked: "Blocked",
  revoked: "Revoked",
};

/** The raw facts about an Auth user that decide its status. */
export type StatusInput = {
  disabled: boolean;
  isAdmin: boolean;
  lastSignInAt: number | null;
  passwordUpdatedAt: number | null;
};

/** Blocked beats Revoked beats Invited beats Active. */
export function deriveStatus(u: StatusInput): TeamStatus {
  if (u.disabled) return "blocked";
  if (!u.isAdmin) return "revoked";
  if (!u.lastSignInAt && !u.passwordUpdatedAt) return "invited";
  return "active";
}

export type SafetyError = "cannot_modify_self" | "last_admin" | "not_allowed";

/** An admin who can sign in and use the CRM right now. Invited users count too: they hold the claim and are not disabled. */
export function isActiveAdmin(status: TeamStatus): boolean {
  return status === "active" || status === "invited";
}

/**
 * Decides whether an action is allowed. Blocking or revoking yourself is refused, and so is any
 * action that would leave no admin who can sign in (admin claim and not disabled).
 */
export function checkSafety(
  users: Pick<TeamUser, "uid" | "status">[],
  target: Pick<TeamUser, "uid" | "status">,
  action: TeamAction,
  callerUid: string
): SafetyError | null {
  if (action === "block" || action === "revoke") {
    if (target.uid === callerUid) return "cannot_modify_self";
    if (isActiveAdmin(target.status)) {
      const remaining = users.filter((u) => u.uid !== target.uid && isActiveAdmin(u.status)).length;
      if (remaining < 1) return "last_admin";
    }
    return null;
  }
  if (action === "unblock") return target.status === "blocked" ? null : "not_allowed";
  if (action === "restore") return target.status === "revoked" ? null : "not_allowed";
  if (action === "reset_password") return target.status === "active" || target.status === "invited" ? null : "not_allowed";
  if (action === "resend_invite") return target.status === "invited" ? null : "not_allowed";
  return "not_allowed";
}
