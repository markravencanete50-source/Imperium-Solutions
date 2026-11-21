import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/crm";
import { sendEmail, teamRecipients, teamReplyTo, type SendEmailResult } from "@/lib/server/email";
import {
  bookingTeamEmail,
  bookingVisitorEmail,
  leadTeamEmail,
  leadVisitorEmail,
  type BookingEmailData,
  type LeadEmailData,
  type RenderedEmail,
} from "@/lib/server/emailTemplates";

// Sends an email and records it under leads/{leadId}/emails.
// Behavior without RESEND_API_KEY: automatic emails are logged with status "skipped".

export type EmailKind = "lead_team" | "lead_visitor" | "booking_team" | "booking_visitor" | "manual";

export type EmailLogInput = {
  leadId: string;
  kind: EmailKind;
  to: string[];
  rendered: Pick<RenderedEmail, "subject" | "text">;
  result: SendEmailResult;
  by?: string;
};

/** Writes the log row. Never throws, so a logging problem cannot break a request. */
export async function logEmail(input: EmailLogInput): Promise<void> {
  try {
    const row: Record<string, unknown> = {
      direction: "out",
      kind: input.kind,
      to: input.to.join(", "),
      subject: input.rendered.subject,
      text: input.rendered.text.slice(0, 20000),
      status: input.result.ok ? "sent" : input.result.error === "not_configured" ? "skipped" : "failed",
      createdAt: FieldValue.serverTimestamp(),
    };
    if (input.result.ok) row.resendId = input.result.id;
    else if (input.result.error !== "not_configured") row.error = input.result.error.slice(0, 500);
    if (input.by) row.by = input.by;
    await getAdminDb().collection(COLLECTIONS.leads).doc(input.leadId).collection("emails").add(row);
  } catch (err) {
    console.error("email log failed", input.kind, err);
  }
}

async function deliver(
  leadId: string,
  kind: EmailKind,
  to: string[],
  rendered: RenderedEmail,
  replyTo: string
): Promise<void> {
  const result = await sendEmail({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    replyTo,
    attachments: rendered.attachments,
  });
  if (!result.ok && result.error !== "not_configured") console.error("email send failed", kind, result.error);
  await logEmail({ leadId, kind, to, rendered, result });
}

/** Team notification plus visitor confirmation for an estimate request. */
export async function sendLeadEmails(d: LeadEmailData): Promise<void> {
  await Promise.allSettled([
    deliver(d.leadId, "lead_team", teamRecipients(), leadTeamEmail(d), d.email),
    deliver(d.leadId, "lead_visitor", [d.email], leadVisitorEmail(d), teamReplyTo()),
  ]);
}

/** Team notification plus visitor confirmation (with calendar file) for a booking. */
export async function sendBookingEmails(d: BookingEmailData): Promise<void> {
  await Promise.allSettled([
    deliver(d.leadId, "booking_team", teamRecipients(), bookingTeamEmail(d), d.email),
    deliver(d.leadId, "booking_visitor", [d.email], bookingVisitorEmail(d), teamReplyTo()),
  ]);
}
