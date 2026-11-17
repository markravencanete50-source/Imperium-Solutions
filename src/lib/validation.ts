import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

// "website" is a honeypot: real visitors never see or fill it.
export const leadSchema = z.object({
  name: text(120).min(1),
  email: z.string().trim().toLowerCase().email().max(200),
  company: text(160).min(1),
  need: text(4000).min(1),
  side: text(40).optional().default(""),
  coverage: text(40).optional().default(""),
  teamSize: text(40).optional().default(""),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  website: z.string().optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

export const bookingSchema = z.object({
  name: text(120).min(1),
  email: z.string().trim().toLowerCase().email().max(200),
  slot: z.string().datetime(),
  visitorTimezone: text(80).optional().default(""),
  website: z.string().optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
