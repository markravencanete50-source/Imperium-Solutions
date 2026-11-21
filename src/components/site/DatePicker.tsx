"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { addDaysToKey, dateKey, parseDateKey } from "@/lib/time";

// Accessible month calendar for the booking form. It opens in the flow of the page under its field
// (nothing floats), moves with the arrow keys, and greys out days with no open times or in the past.
// Day names and month lengths come from pure calendar arithmetic, so the zone only decides "today".

type Props = {
  id: string;
  /** Selected day, YYYY-MM-DD, or "". */
  value: string;
  onChange: (key: string) => void;
  /** Today in the chosen zone, or "" until the first answer arrives. */
  today: string;
  /** Last bookable day in the chosen zone, or "". */
  lastDate: string;
  /** Month on screen, YYYY-MM. */
  month: string;
  onMonthChange: (month: string) => void;
  /** Open slot count per day for the months that are loaded. A missing day means not loaded yet. */
  counts: Record<string, number>;
  loading: boolean;
  invalid?: boolean;
  describedBy?: string;
};

const WEEKDAYS = [
  ["Su", "Sunday"],
  ["Mo", "Monday"],
  ["Tu", "Tuesday"],
  ["We", "Wednesday"],
  ["Th", "Thursday"],
  ["Fr", "Friday"],
  ["Sa", "Saturday"],
];

const utcFormat = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts });
const fmtMonth = utcFormat({ month: "long", year: "numeric" });
const fmtLong = utcFormat({ weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function formatDay(key: string): string {
  const p = parseDateKey(key);
  return p ? fmtLong.format(new Date(Date.UTC(p.year, p.month - 1, p.day))) : "";
}

export function monthOf(key: string): string {
  return key.slice(0, 7);
}

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${String(d.getUTCFullYear()).padStart(4, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function weekdayOf(key: string): number {
  const p = parseDateKey(key);
  return p ? new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() : 0;
}

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function CalendarIcon() {
  return (
    <svg className="dp-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.75h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function DatePicker({
  id,
  value,
  onChange,
  today,
  lastDate,
  month,
  onMonthChange,
  counts,
  loading,
  invalid,
  describedBy,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focusKey, setFocusKey] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const wantFocus = useRef(false);
  const popId = useId();

  const isOpen = (key: string) => Boolean(today) && key >= today && (!lastDate || key <= lastDate) && (counts[key] ?? 0) > 0;

  // Move keyboard focus onto the focused day after a render that asked for it.
  useEffect(() => {
    if (open && wantFocus.current) {
      wantFocus.current = false;
      gridRef.current?.querySelector<HTMLElement>(`[data-key="${focusKey}"]`)?.focus();
    }
  });

  // Close on a pointer press outside, or when focus leaves to another part of the page.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    let start = value && monthOf(value) === month ? value : "";
    if (!start && today && monthOf(today) === month) start = today;
    if (!start) start = `${month}-01`;
    setFocusKey(start);
    wantFocus.current = true;
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function moveTo(key: string) {
    // Never move before today or past the last bookable day.
    let next = key;
    if (today && next < today) next = today;
    if (lastDate && next > lastDate) next = lastDate;
    if (monthOf(next) !== month) onMonthChange(monthOf(next));
    setFocusKey(next);
    wantFocus.current = true;
  }

  function onGridKey(e: KeyboardEvent) {
    const from = focusKey || value || today;
    if (!from) return;
    let target = "";
    switch (e.key) {
      case "ArrowLeft":
        target = addDaysToKey(from, -1);
        break;
      case "ArrowRight":
        target = addDaysToKey(from, 1);
        break;
      case "ArrowUp":
        target = addDaysToKey(from, -7);
        break;
      case "ArrowDown":
        target = addDaysToKey(from, 7);
        break;
      case "Home": {
        const dow = weekdayOf(from);
        target = addDaysToKey(from, -dow);
        break;
      }
      case "End": {
        const dow = weekdayOf(from);
        target = addDaysToKey(from, 6 - dow);
        break;
      }
      case "PageUp":
      case "PageDown": {
        const delta = e.key === "PageUp" ? -1 : 1;
        const nextMonth = addMonths(monthOf(from), delta);
        const day = Math.min(Number(from.slice(8, 10)), daysInMonth(nextMonth));
        target = `${nextMonth}-${String(day).padStart(2, "0")}`;
        break;
      }
      default:
        return;
    }
    e.preventDefault();
    moveTo(target);
  }

  const [yy, mm] = month.split("-").map(Number);
  const first = new Date(Date.UTC(yy, mm - 1, 1)).getUTCDay();
  const total = daysInMonth(month);
  const cells: (string | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(dateKey(yy, mm, d));
  while (cells.length % 7) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const canPrev = Boolean(today) && month > monthOf(today);
  const canNext = Boolean(lastDate) && month < monthOf(lastDate);
  // Tab order inside the grid: the focused day, else the selected day, else the first day shown.
  const tabKey = focusKey && monthOf(focusKey) === month ? focusKey : value && monthOf(value) === month ? value : `${month}-01`;

  return (
    <div
      className="dp"
      ref={wrapRef}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (open && next && wrapRef.current && !wrapRef.current.contains(next)) setOpen(false);
      }}
    >
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`dp-field${invalid ? " is-invalid" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        aria-describedby={describedBy}
        onClick={toggle}
      >
        <span className={value ? "dp-value" : "dp-placeholder"}>{value ? formatDay(value) : "Choose a date"}</span>
        <CalendarIcon />
      </button>

      {open ? (
        <div
          className="dp-pop"
          id={popId}
          role="dialog"
          aria-label="Choose a date"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close(true);
            }
          }}
        >
          <div className="dp-head">
            <button type="button" className="dp-nav" aria-label="Previous month" disabled={!canPrev} onClick={() => onMonthChange(addMonths(month, -1))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="dp-month" aria-live="polite">
              {fmtMonth.format(new Date(Date.UTC(yy, mm - 1, 1)))}
            </p>
            <button type="button" className="dp-nav" aria-label="Next month" disabled={!canNext} onClick={() => onMonthChange(addMonths(month, 1))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <table className="dp-grid" role="grid" aria-label={fmtMonth.format(new Date(Date.UTC(yy, mm - 1, 1)))} aria-busy={loading} ref={gridRef} onKeyDown={onGridKey}>
            <thead>
              <tr>
                {WEEKDAYS.map(([short, full]) => (
                  <th key={short} scope="col" abbr={full}>
                    {short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((key, c) => {
                    if (!key) return <td key={c} />;
                    const available = isOpen(key);
                    const selected = key === value;
                    const label =
                      formatDay(key) + (available ? "" : loading && counts[key] === undefined ? ", loading" : ", no open times");
                    return (
                      <td key={key} role="gridcell" aria-selected={selected || undefined}>
                        <button
                          type="button"
                          data-key={key}
                          className={`dp-day${selected ? " is-selected" : ""}${key === today ? " is-today" : ""}${available ? "" : " is-off"}`}
                          tabIndex={key === tabKey ? 0 : -1}
                          aria-disabled={!available || undefined}
                          aria-label={label}
                          aria-current={key === today ? "date" : undefined}
                          onClick={() => {
                            if (!available) return;
                            onChange(key);
                            close(true);
                          }}
                          onFocus={() => setFocusKey(key)}
                        >
                          {Number(key.slice(8, 10))}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dp-note" role="status">
            {loading ? "Loading open days." : "Days that are greyed out have no open times."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
