import { z } from "zod";
import { bookingBudgetOptions, bookingIndustryOptions, bookingNeedOptions } from "@/lib/content";
import { isValidZone } from "@/lib/time";

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
  company: text(160).optional().default(""),
  industry: z.string().trim().refine((v) => bookingIndustryOptions.includes(v), "Choose an industry."),
  needs: z
    .array(z.enum(bookingNeedOptions))
    .min(1, "Choose at least one.")
    .max(bookingNeedOptions.length)
    .transform((list) => bookingNeedOptions.filter((n) => list.includes(n))),
  budget: z.enum(bookingBudgetOptions),
  notes: text(2000).optional().default(""),
  slot: z.string().datetime(),
  visitorTimezone: text(80)
    .optional()
    .default("")
    .refine((z) => !z || isValidZone(z), "Unknown time zone."),
  website: z.string().optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

// GET /api/availability. start defaults to today in the chosen zone.
export const MAX_AVAILABILITY_DAYS = 42;
export const availabilityQuerySchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  days: z.coerce.number().int().min(1).max(MAX_AVAILABILITY_DAYS).optional().default(1),
  tz: z
    .string()
    .max(80)
    .optional()
    .refine((z) => !z || isValidZone(z), "Unknown time zone."),
  summary: z
    .enum(["0", "1", "true", "false"])
    .optional()
    .transform((v) => v === "1" || v === "true"),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
