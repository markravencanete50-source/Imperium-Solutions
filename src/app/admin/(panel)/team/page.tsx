"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AField, ConfirmButton, Empty, ErrorNote, PageTitle, Panel, useAction } from "@/components/admin/ui";
import {
  EmailExistsError,
  inviteMember,
  loadTeam,
  runTeamAction,
  type LinkResult,
  type TeamList,
} from "@/components/admin/teamApi";
import { STATUS_LABELS, type AuditAction, type TeamAction, type TeamUser } from "@/lib/team";

const AUDIT_TEXT: Record<AuditAction, string> = {
  invite: "invited",
  resend_invite: "sent a new invite to",
  block: "blocked",
  unblock: "unblocked",
  revoke: "removed admin access for",
  restore: "restored admin access for",
  reset_password: "sent a password reset to",
};

const DONE_TEXT: Record<TeamAction, string> = {
  block: "blocked and signed out everywhere",
  unblock: "unblocked",
  revoke: "no longer has admin access and was signed out everywhere",
  restore: "has admin access again",
  reset_password: "was sent a password reset",
  resend_invite: "was sent a new invite",
};

function formatTime(ms: number | null): string {
  if (!ms) return "Never";
  return new Date(ms).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function formatDay(ms: number | null): string {
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("en-US", { dateStyle: "medium" });
}

/** A link the inviting admin has to pass on by hand, because no email went out. */
type ManualLink = { email: string; link: string; what: "invite" | "reset"; reason: "not_configured" | "send_failed" };

function manualLinkFrom(result: LinkResult, email: string, what: ManualLink["what"]): ManualLink | null {
  if (result.emailSent || !result.link) return null;
  return { email, link: result.link, what, reason: result.emailError === "send_failed" ? "send_failed" : "not_configured" };
}

function LinkNotice({ item, onDismiss }: { item: ManualLink; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section className="panel-box team-link" aria-label="Link to send by hand">
      <header>
        <h2>Send this link yourself</h2>
        <button className="abtn abtn--quiet" type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </header>
      <p>
        {item.reason === "not_configured"
          ? "Email is not set up on this site, so no email was sent."
          : "The email could not be sent."}{" "}
        Copy the link below and send it to {item.email}.{" "}
        {item.what === "invite" ? "It lets them choose a password for their new account." : "It lets them choose a new password."}{" "}
        It works for a limited time and only for that person, so do not post it anywhere public.
      </p>
      <div className="team-link-row">
        <input readOnly value={item.link} aria-label="Password link" onFocus={(e) => e.currentTarget.select()} />
        <button className="abtn abtn--primary" type="button" onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </section>
  );
}

export default function TeamPage() {
  const [data, setData] = useState<TeamList | null>(null);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [existing, setExisting] = useState<EmailExistsError | null>(null);
  const [notice, setNotice] = useState("");
  const [manual, setManual] = useState<ManualLink | null>(null);
  const [busy, setBusy] = useState("");
  const invite = useAction();
  const act = useAction();

  const refresh = useCallback(async () => {
    try {
      setData(await loadTeam());
      setLoadError("");
    } catch (err) {
      setLoadError(`Could not load the team: ${err instanceof Error ? err.message : "something went wrong"}`);
    }
  }, []);

  useEffect(() => {
    // Load once on mount. The state updates happen after the request resolves.
    let live = true;
    loadTeam()
      .then((d) => live && setData(d))
      .catch((err) => live && setLoadError(`Could not load the team: ${err instanceof Error ? err.message : "something went wrong"}`));
    return () => {
      live = false;
    };
  }, []);

  async function submitInvite(e: FormEvent, restore = false) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setNotice("");
    setExisting(null);
    setManual(null);
    setBusy("invite");
    let offered = false;
    try {
      const ok = await invite.run(async () => {
        try {
          const result = await inviteMember({ name: name.trim(), email: email.trim(), restore });
          if (result.restored) {
            setNotice(`${result.user.email} has admin access again.`);
          } else if (result.emailSent) {
            setNotice(`Invite sent to ${result.user.email}.`);
          } else {
            setNotice(`Account created for ${result.user.email}. No email went out, so send them the link below.`);
            setManual(manualLinkFrom(result, result.user.email, "invite"));
          }
        } catch (err) {
          if (err instanceof EmailExistsError && err.canRestore) {
            offered = true;
            setExisting(err);
            return;
          }
          throw err;
        }
      }, "Could not invite");
      if (ok) {
        // Keep the form filled while the restore offer is showing.
        if (!offered) {
          setName("");
          setEmail("");
        }
        await refresh();
      }
    } finally {
      setBusy("");
    }
  }

  async function runAction(user: TeamUser, action: TeamAction) {
    setNotice("");
    setManual(null);
    setBusy(`${user.uid}:${action}`);
    try {
      const ok = await act.run(async () => {
        const result = await runTeamAction(user.uid, action);
        const who = user.name || user.email;
        if (action === "reset_password" || action === "resend_invite") {
          const m = manualLinkFrom({ emailSent: result.emailSent === true, emailError: result.emailError, link: result.link }, user.email, action === "resend_invite" ? "invite" : "reset");
          if (m) {
            setManual(m);
            setNotice(`No email went out for ${who}. Send them the link below.`);
            return;
          }
        }
        setNotice(`${who} ${DONE_TEXT[action]}.`);
      }, "Could not update");
      if (ok) await refresh();
    } finally {
      setBusy("");
    }
  }

  const users = data?.users ?? [];
  const me = data?.me.uid;

  return (
    <>
      <PageTitle title="Team" sub="Invite people to the admin, and remove or pause their access." />

      {loadError ? <p className="adm-error">{loadError}</p> : null}
      {notice ? (
        <p className="team-notice" role="status">
          {notice}
        </p>
      ) : null}
      {manual ? <LinkNotice item={manual} onDismiss={() => setManual(null)} /> : null}

      <Panel title="Invite someone">
        <form className="aform team-invite" onSubmit={(e) => submitInvite(e)}>
          <div className="form-row">
            <AField label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="off" required />
            </AField>
            <AField label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="off" required />
            </AField>
          </div>
          <ErrorNote message={invite.error} />
          {existing ? (
            <div className="team-restore" role="alert">
              <p>
                {email.trim()} already has an account, but its admin access was removed. Restore access instead of
                creating a new account?
              </p>
              <div className="drawer-actions">
                <button
                  className="abtn abtn--primary"
                  type="button"
                  disabled={busy === "invite"}
                  onClick={(e) => submitInvite(e, true)}
                >
                  Restore access
                </button>
                <button className="abtn abtn--quiet" type="button" onClick={() => setExisting(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          <div className="drawer-actions team-invite-actions">
            <button className="abtn abtn--primary" type="submit" disabled={busy === "invite"}>
              {busy === "invite" ? "Sending" : "Send invite"}
            </button>
            <span className="saved">
              They get an email with a link to choose a password.
              {data && !data.emailConfigured ? " Email is not set up here, so you will get the link to send yourself." : ""}
            </span>
          </div>
        </form>
      </Panel>

      <Panel title="Team members">
        <ErrorNote message={act.error} />
        {!data && !loadError ? <Empty>Loading the team</Empty> : null}
        {data && users.length === 0 ? <Empty>No users yet.</Empty> : null}
        {users.length ? (
          <ul className="team-list">
            <li className="team-head" aria-hidden="true">
              <span>Person</span>
              <span>Status</span>
              <span>Last sign in</span>
              <span>Created</span>
              <span>Actions</span>
            </li>
            {users.map((u) => {
              const isMe = u.uid === me;
              const working = (a: TeamAction) => busy === `${u.uid}:${a}`;
              return (
                <li className="team-row" key={u.uid}>
                  <div className="team-who">
                    <b>
                      {u.name || u.email}
                      {isMe ? <span className="team-you">You</span> : null}
                    </b>
                    {u.name ? <span>{u.email}</span> : null}
                  </div>
                  <div className="team-cell" data-label="Status">
                    <span className={`pill pill--team-${u.status}`}>{STATUS_LABELS[u.status]}</span>
                  </div>
                  <div className="team-cell" data-label="Last sign in">
                    {formatTime(u.lastSignInAt)}
                  </div>
                  <div className="team-cell" data-label="Created">
                    {formatDay(u.createdAt)}
                  </div>
                  <div className="team-actions">
                    {u.status === "invited" ? (
                      <button className="abtn" type="button" disabled={!!busy} onClick={() => runAction(u, "resend_invite")}>
                        {working("resend_invite") ? "Sending" : "Resend invite"}
                      </button>
                    ) : null}
                    {u.status === "active" ? (
                      <button className="abtn" type="button" disabled={!!busy} onClick={() => runAction(u, "reset_password")}>
                        {working("reset_password") ? "Sending" : "Reset password"}
                      </button>
                    ) : null}
                    {u.status === "blocked" ? (
                      <button className="abtn" type="button" disabled={!!busy} onClick={() => runAction(u, "unblock")}>
                        {working("unblock") ? "Working" : "Unblock"}
                      </button>
                    ) : null}
                    {u.status === "revoked" ? (
                      <button className="abtn" type="button" disabled={!!busy} onClick={() => runAction(u, "restore")}>
                        {working("restore") ? "Working" : "Restore access"}
                      </button>
                    ) : null}
                    {!isMe && (u.status === "active" || u.status === "invited") ? (
                      <>
                        <ConfirmButton label="Block" onConfirm={() => runAction(u, "block")} />
                        <ConfirmButton label="Revoke access" onConfirm={() => runAction(u, "revoke")} />
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="team-help">
          Blocked people cannot sign in. Revoked people can sign in but see no admin pages. Both are signed out within a
          few minutes.
        </p>
      </Panel>

      <Panel title="Recent activity">
        {data && data.audit.length === 0 ? <Empty>Nothing yet. Invites, blocks and access changes appear here.</Empty> : null}
        {data && data.audit.length ? (
          <ul className="list team-audit">
            {data.audit.map((a) => (
              <li key={a.id}>
                <span className="team-audit-text">
                  <b>{a.by}</b> {AUDIT_TEXT[a.action] || a.action} <b>{a.targetEmail}</b>
                </span>
                <span className="team-audit-time">{formatTime(a.at)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </>
  );
}
