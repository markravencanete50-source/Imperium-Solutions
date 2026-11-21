// Shared CRM vocabulary: collection names, record shapes, and display helpers.
// Used by the API routes (server) and the admin dashboard (client).

export const COLLECTIONS = {
  leads: "leads",
  bookings: "bookings",
  clients: "clients",
  deals: "deals",
  payments: "payments",
  settings: "settings",
} as const;

export const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const TEMPERATURES = ["unrated", "hot", "medium", "low"] as const;
export type Temperature = (typeof TEMPERATURES)[number];

export const DEAL_STAGES = ["discovery", "proposal", "negotiation", "won", "lost"] as const;
export type DealStage = (typeof DEAL_STAGES)[number];
export const OPEN_DEAL_STAGES: DealStage[] = ["discovery", "proposal", "negotiation"];

export const CLIENT_STATUSES = ["active", "onboarding", "paused", "ended"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const BOOKING_STATUSES = ["booked", "completed", "no_show", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// Firestore timestamps arrive as objects with toDate() on the client.
export type Stamp = { toDate: () => Date } | null | undefined;

export type Lead = {
  id: string;
  type: "estimate" | "consultation" | "manual";
  name: string;
  email: string;
  company?: string;
  need?: string;
  side?: string;
  coverage?: string;
  teamSize?: string;
  startDate?: string;
  status: LeadStatus;
  temperature: Temperature;
  source: string;
  clientId?: string;
  createdAt?: Stamp;
  updatedAt?: Stamp;
};

export type Activity = {
  id: string;
  text: string;
  by: string;
  createdAt?: Stamp;
};

export const EMAIL_KINDS = {
  lead_team: "Team notification",
  lead_visitor: "Confirmation to visitor",
  booking_team: "Booking notification",
  booking_visitor: "Booking confirmation",
  manual: "Sent from admin",
} as const;
export type EmailKind = keyof typeof EMAIL_KINDS;

/** One row of leads/{id}/emails, written by the server for every outbound email. */
export type EmailLog = {
  id: string;
  direction: "out";
  kind: EmailKind;
  to: string;
  subject: string;
  text: string;
  status: "sent" | "failed" | "skipped";
  resendId?: string;
  error?: string;
  by?: string;
  createdAt?: Stamp;
};

export type Client = {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  industry?: string;
  services?: string;
  status: ClientStatus;
  monthlyValue: number;
  startDate?: string;
  notes?: string;
  leadId?: string;
  createdAt?: Stamp;
  updatedAt?: Stamp;
};

export type Deal = {
  id: string;
  title: string;
  company: string;
  clientId?: string;
  leadId?: string;
  stage: DealStage;
  value: number;
  billing: "monthly" | "one_time";
  expectedClose?: string;
  wonAt?: Stamp;
  createdAt?: Stamp;
  updatedAt?: Stamp;
};

export type Payment = {
  id: string;
  clientId?: string;
  clientName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt?: Stamp;
};

export type Booking = {
  id: string;
  slotStart?: Stamp;
  name: string;
  email: string;
  visitorTimezone?: string;
  status: BookingStatus;
  leadId?: string;
  createdAt?: Stamp;
};

export type BookingSettings = {
  timezone: string;
  weekdays: number[]; // 0 Sunday to 6 Saturday
  times: string[]; // "HH:MM" in the settings time zone
  daysAhead: number;
  minNoticeHours: number;
  durationMinutes: number;
};

// Placeholder availability. Set the real hours in Admin, Settings.
export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  timezone: "America/New_York",
  weekdays: [1, 2, 3, 4, 5],
  times: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
  daysAhead: 10,
  minNoticeHours: 12,
  durationMinutes: 15,
};

export function label(value: string): string {
  const s = value.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function money(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
}

export function toDate(s: Stamp): Date | null {
  return s && typeof s.toDate === "function" ? s.toDate() : null;
}

export function shortDate(s: Stamp | string): string {
  const d = typeof s === "string" ? (s ? new Date(s + "T00:00:00") : null) : toDate(s);
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function dateTime(s: Stamp): string {
  const d = toDate(s);
  if (!d) return "";
  return d.toLocaleString("en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
