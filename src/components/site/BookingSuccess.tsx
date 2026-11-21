"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/content";

// Shown in place of the booking form once the slot is saved. The check mark draws itself, a ring
// pulses once and the text rises in. Reduced motion shows the finished state with no animation
// (the rules live in globals.css under .ok).

export type BookingSummary = {
  day: string; // "Tuesday, November 24, 2026"
  time: string; // "12:30 PM"
  zone: string; // "Eastern Time (EST/EDT), New York"
  minutes: number;
  email: string;
  rows: [string, string][];
};

export default function BookingSuccess({ summary }: { summary: BookingSummary }) {
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    root.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, []);

  return (
    <div className="done ok" role="status" ref={root}>
      <svg className="ok-mark" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <circle className="ok-pulse" cx="60" cy="60" r="46" />
        <circle className="ok-ring" cx="60" cy="60" r="46" pathLength="1" />
        <path className="ok-check" d="M38 62.5l15.5 15.5L83 44" pathLength="1" />
      </svg>

      <div className="ok-body">
        <h3 tabIndex={-1} ref={heading} className="ok-in" style={{ "--d": "1.1s" } as React.CSSProperties}>
          Your consultation is booked.
        </h3>

        <div className="ok-when ok-in" style={{ "--d": "1.3s" } as React.CSSProperties}>
          <span className="ok-day">{summary.day}</span>
          <span className="ok-time">{summary.time}</span>
          <span className="ok-zone">
            {summary.zone}. {summary.minutes} minutes.
          </span>
        </div>

        <p className="ok-lead ok-in" style={{ "--d": "1.5s" } as React.CSSProperties}>
          We will get back to you as soon as possible.
        </p>
        <p className="ok-in" style={{ "--d": "1.65s" } as React.CSSProperties}>
          A confirmation with a calendar file is on its way to {summary.email}.
        </p>

        {summary.rows.length ? (
          <dl className="ok-answers ok-in" style={{ "--d": "1.8s" } as React.CSSProperties}>
            {summary.rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <p className="ok-in ok-fine" style={{ "--d": "1.95s" } as React.CSSProperties}>
          Need to change the time? Reply to the confirmation email or write to {site.contactEmail}.
        </p>
      </div>
    </div>
  );
}
