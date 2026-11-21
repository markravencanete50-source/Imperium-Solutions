import "server-only";
import { Resend } from "resend";

// Outbound email through Resend. Skipped cleanly when RESEND_API_KEY is not set,
// so the site works before the key is added. Nothing here ever throws.

export const DEFAULT_FROM = "Imperium Solutions <tom@imperiumsolutionshq.com>";
export const DEFAULT_TEAM_TO = "tom@imperiumsolutionshq.com";

export type EmailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType?: string;
};

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

/** The team inboxes that receive notifications. EMAIL_TEAM_TO may hold several, comma separated. */
export function teamRecipients(): string[] {
  const list = (process.env.EMAIL_TEAM_TO || DEFAULT_TEAM_TO)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : [DEFAULT_TEAM_TO];
}

/** The address replies should reach when the visitor answers an automatic email. */
export function teamReplyTo(): string {
  return teamRecipients()[0];
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "not_configured" };
  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from: emailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
    if (error || !data) return { ok: false, error: error?.message || "send_failed" };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send_failed" };
  }
}
