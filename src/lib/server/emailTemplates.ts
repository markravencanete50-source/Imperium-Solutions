import "server-only";
import { site } from "@/lib/content";
import { isValidZone } from "@/lib/time";
import type { EmailAttachment } from "@/lib/server/email";

// Email copy and markup. Plain inline styles, no layout tables, and every
// piece of visitor input is escaped before it reaches the HTML.
// Copy rules: no em dashes, no emojis, no decorative symbols.

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
};

export type LeadEmailData = {
  leadId: string;
  name: string;
  email: string;
  company: string;
  need: string;
  side?: string;
  coverage?: string;
  teamSize?: string;
  startDate?: string;
};

export type BookingEmailData = {
  leadId: string;
  bookingId: string;
  name: string;
  email: string;
  company?: string;
  industry?: string;
  needs?: string[];
  budget?: string;
  notes?: string;
  slot: Date;
  visitorTimezone?: string;
  settingsTimezone: string;
  durationMinutes: number;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Removes line breaks and control characters so a value is safe inside a subject line. */
function oneLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}

function siteUrl(): string {
  return site.url.replace(/\/+$/, "");
}

function firstName(name: string): string {
  return oneLine(name).split(" ")[0] || "there";
}

/** Formats an instant for people, in the given zone, for example "Tuesday, November 24, 2026 at 9:30 AM EST". */
export function formatWhen(date: Date, zone: string): string {
  return date.toLocaleString("en-US", {
    timeZone: zone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

const INK = "#0B0C15";
const MUTED = "#5A5F78";
const LINE = "#DCDFE8";
const AMBER = "#F6B312";

const pStyle = `margin:0 0 14px;font-size:16px;line-height:1.55;color:${INK}`;

function p(html: string): string {
  return `<p style="${pStyle}">${html}</p>`;
}

function field(name: string, value: string): string {
  return (
    `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:${INK}">` +
    `<span style="display:block;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${MUTED}">${escapeHtml(name)}</span>` +
    `<span style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value)}</span></p>`
  );
}

function button(href: string, text: string): string {
  return (
    `<p style="margin:20px 0 6px"><a href="${escapeHtml(href)}" ` +
    `style="display:inline-block;padding:11px 20px;background:${AMBER};color:${INK};font-weight:700;font-size:15px;text-decoration:none;border-radius:4px">` +
    `${escapeHtml(text)}</a></p>`
  );
}

function layout(heading: string, inner: string, footer: string): string {
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>${escapeHtml(heading)}</title></head>` +
    `<body style="margin:0;padding:24px 12px;background:#F3F4F8;font-family:Arial,Helvetica,sans-serif">` +
    `<div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid ${LINE};border-radius:6px">` +
    `<div style="padding:18px 24px;background:${INK};border-radius:6px 6px 0 0;color:#FFFFFF;font-size:17px;font-weight:700">${escapeHtml(site.name)}</div>` +
    `<div style="padding:24px">` +
    `<h1 style="margin:0 0 16px;font-size:21px;line-height:1.25;color:${INK}">${escapeHtml(heading)}</h1>` +
    inner +
    `</div>` +
    `<div style="padding:14px 24px;border-top:1px solid ${LINE};font-size:13px;line-height:1.5;color:${MUTED}">${footer}</div>` +
    `</div></body></html>`
  );
}

const visitorFooter = () =>
  `${escapeHtml(site.legalName)}. Reply to this email and it reaches our team directly.`;

const teamFooter = () => `Sent by the ${escapeHtml(site.name)} website. Replying goes to the visitor.`;

function leadFields(d: LeadEmailData): [string, string][] {
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Company", d.company],
    ["Support needed", d.side || ""],
    ["Coverage", d.coverage || ""],
    ["Team size", d.teamSize || ""],
    ["Target start", d.startDate || ""],
    ["What they need", d.need],
  ];
  return rows.filter(([, v]) => v);
}

/** Estimate request: the notification the team receives. */
export function leadTeamEmail(d: LeadEmailData): RenderedEmail {
  const subject = `New estimate request: ${oneLine(d.name)}, ${oneLine(d.company)}`;
  const link = `${siteUrl()}/admin/leads`;
  const rows = leadFields(d);
  const html = layout(
    "New estimate request",
    p("Someone filled in the estimate form on the website. The details are below.") +
      rows.map(([k, v]) => field(k, v)).join("") +
      button(link, "Open leads in the admin"),
    teamFooter()
  );
  const text = [
    "New estimate request",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Open leads: ${link}`,
  ].join("\n");
  return { subject, html, text };
}

/** Estimate request: the confirmation the visitor receives. */
export function leadVisitorEmail(d: LeadEmailData): RenderedEmail {
  const subject = `We received your estimate request`;
  const hi = `Hi ${firstName(d.name)},`;
  const contact = `${siteUrl()}/contact`;
  const html = layout(
    "Thanks, we have your request",
    p(escapeHtml(hi)) +
      p(
        `Thank you for contacting ${escapeHtml(site.name)}. We have your estimate request for ${escapeHtml(oneLine(d.company))} and our team will review it shortly.`
      ) +
      `<p style="margin:0 0 6px;font-size:16px;font-weight:700;color:${INK}">What happens next</p>` +
      p("We review what you need, then reply by email, usually within one business day, with questions or a first outline of the support team we would suggest.") +
      p(`If you would rather talk it through, you can book a short call at <a href="${escapeHtml(contact)}" style="color:${INK}">${escapeHtml(contact)}</a>.`) +
      p("You can reply to this email at any time and add anything we should know."),
    visitorFooter()
  );
  const text = [
    hi,
    "",
    `Thank you for contacting ${site.name}. We have your estimate request for ${oneLine(d.company)} and our team will review it shortly.`,
    "",
    "What happens next",
    "We review what you need, then reply by email, usually within one business day, with questions or a first outline of the support team we would suggest.",
    "",
    `If you would rather talk it through, you can book a short call at ${contact}.`,
    "",
    "You can reply to this email at any time and add anything we should know.",
    "",
    site.legalName,
  ].join("\n");
  return { subject, html, text };
}

/** The visitor's zone when it is valid, otherwise the zone the bookings are set up in. */
export function resolveVisitorZone(visitorTimezone: string | undefined, fallback: string): string {
  const z = (visitorTimezone || "").trim();
  return z && isValidZone(z) ? z : fallback;
}

/** The answers from the booking form, as label and value rows. Empty answers are left out. */
function bookingAnswerRows(d: BookingEmailData): [string, string][] {
  const rows: [string, string][] = [
    ["Company", d.company || ""],
    ["Industry", d.industry || ""],
    ["What they need", (d.needs || []).join(", ")],
    ["Monthly budget", d.budget || ""],
    ["Notes", d.notes || ""],
  ];
  return rows.filter(([, v]) => v);
}

/** Booking: the notification the team receives. */
export function bookingTeamEmail(d: BookingEmailData): RenderedEmail {
  const when = formatWhen(d.slot, d.settingsTimezone);
  const visitorZone = (d.visitorTimezone || "").trim() && isValidZone(d.visitorTimezone || "") ? (d.visitorTimezone as string) : "";
  const theirTime = visitorZone ? formatWhen(d.slot, visitorZone) : "";
  const subject = `New consultation booked: ${oneLine(d.name)}, ${when}`;
  const link = `${siteUrl()}/admin/bookings`;
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    [`When (${d.settingsTimezone})`, when],
    ["Visitor time zone", visitorZone || (d.visitorTimezone ? `${d.visitorTimezone} (not recognised)` : "Not given")],
    ["In their time", theirTime],
    ["Length", `${d.durationMinutes} minutes`],
    ...bookingAnswerRows(d),
  ];
  const shown = rows.filter(([, v]) => v);
  const html = layout(
    "New consultation booked",
    p("Someone booked a consultation on the website. A calendar invite was attached to their confirmation.") +
      shown.map(([k, v]) => field(k, v)).join("") +
      button(link, "Open bookings in the admin"),
    teamFooter()
  );
  const text = [
    "New consultation booked",
    "",
    ...shown.map(([k, v]) => `${k}: ${v}`),
    "",
    `Open bookings: ${link}`,
  ].join("\n");
  return { subject, html, text };
}

// ----- Calendar file -----

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds a content line to 75 octets, continuing with a leading space, as RFC 5545 requires. */
function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split inside a multi byte character.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74;
  }
  return parts.join("\r\n ");
}

function icsStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildIcs(d: BookingEmailData, now: Date = new Date()): string {
  const end = new Date(d.slot.getTime() + d.durationMinutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Imperium Solutions//Website//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${d.bookingId}@imperiumsolutionsinc.com`,
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART:${icsStamp(d.slot)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(`${site.name} consultation`)}`,
    `DESCRIPTION:${icsEscape(`A ${d.durationMinutes} minute consultation with the ${site.name} team. We will use it to understand your needs and recommend a solution. Reply to the confirmation email if you need to change the time.`)}`,
    `ORGANIZER;CN=${icsEscape(site.name)}:mailto:tom@imperiumsolutionshq.com`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** Booking: the confirmation the visitor receives, with a calendar file attached. */
export function bookingVisitorEmail(d: BookingEmailData, now: Date = new Date()): RenderedEmail {
  const zone = resolveVisitorZone(d.visitorTimezone, d.settingsTimezone);
  const when = formatWhen(d.slot, zone);
  const hi = `Hi ${firstName(d.name)},`;
  const subject = `Your consultation is booked: ${when}`;
  const answers = bookingAnswerRows(d);
  const intro = `Your ${d.durationMinutes} minute consultation with ${site.name} is booked.`;
  const next = "Our team will get back to you as soon as possible.";
  const attach = "A calendar file is attached so you can add the call to your calendar. If you need a different time, reply to this email and we will move it.";
  const html = layout(
    "Your consultation is booked",
    p(escapeHtml(hi)) +
      p(escapeHtml(intro)) +
      field("When", when) +
      field("Time zone", zone.replace(/_/g, " ")) +
      field("Length", `${d.durationMinutes} minutes`) +
      p(escapeHtml(next)) +
      (answers.length
        ? `<p style="margin:18px 0 10px;font-size:16px;font-weight:700;color:${INK}">What you told us</p>` +
          answers.map(([k, v]) => field(k, v)).join("")
        : "") +
      p(escapeHtml(attach)),
    visitorFooter()
  );
  const text = [
    hi,
    "",
    intro,
    "",
    `When: ${when}`,
    `Time zone: ${zone.replace(/_/g, " ")}`,
    `Length: ${d.durationMinutes} minutes`,
    "",
    next,
    "",
    ...(answers.length ? ["What you told us", ...answers.map(([k, v]) => `${k}: ${v}`), ""] : []),
    attach,
    "",
    site.legalName,
  ].join("\n");
  return {
    subject,
    html,
    text,
    attachments: [{ filename: "consultation.ics", content: buildIcs(d, now), contentType: "text/calendar; charset=utf-8; method=PUBLISH" }],
  };
}

/** A message written by hand in the admin: escaped paragraphs plus the plain text. */
export function manualEmail(subject: string, body: string): RenderedEmail {
  const clean = body.replace(/\r\n/g, "\n").trim();
  const paragraphs = clean
    .split(/\n{2,}/)
    .map((para) => p(escapeHtml(para).replace(/\n/g, "<br>")))
    .join("");
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(oneLine(subject))}</title></head>` +
    `<body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif">` +
    `<div style="max-width:600px">${paragraphs}` +
    `<p style="margin:18px 0 0;font-size:13px;color:${MUTED}">${escapeHtml(site.name)}</p></div></body></html>`;
  const text = `${clean}\n\n${site.name}`;
  return { subject: oneLine(subject), html, text };
}
