"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { bookingBudgetOptions, bookingIndustryOptions, bookingNeedOptions, site } from "@/lib/content";
import { dateKeyInZone } from "@/lib/time";
import { isCommonZone, zoneAbbreviation, zoneLabel } from "@/lib/timezones";
import DatePicker, { formatDay, monthOf } from "./DatePicker";
import TimeZoneSelect from "./TimeZoneSelect";
import BookingSuccess, { type BookingSummary } from "./BookingSuccess";
import { Field, Turnstile, errorText, postJson, validEmail } from "./formKit";

// Book a consultation: step 1 collects who you are and what you need, step 2 picks a day and a time
// in the visitor's own time zone. Availability comes from /api/availability, one month of day counts
// for the calendar and one day of slots for the time grid.

type AvailabilityResponse = {
  today: string;
  lastDate: string;
  durationMinutes: number;
  summary: Record<string, { open: number; taken: number }>;
  open?: string[];
  taken?: string[];
};

type Calendar = {
  zone: string;
  today: string;
  lastDate: string;
  minutes: number;
  counts: Record<string, number>;
  months: string[];
};

type DayData = { zone: string; date: string; open: string[]; taken: string[] };

const noSubscribe = () => () => {};
const readZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

async function fetchAvailability(params: Record<string, string>): Promise<AvailabilityResponse | null> {
  try {
    const res = await fetch(`/api/availability?${new URLSearchParams(params)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as AvailabilityResponse;
  } catch {
    return null;
  }
}

function monthDays(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

const FIELD_NAMES: Record<string, string> = {
  name: "Enter your name.",
  email: "Enter an email address like name@company.com.",
  industry: "Choose your industry.",
  needs: "Choose at least one thing you need help with.",
  budget: "Choose a monthly budget, or Not sure yet.",
  slot: "Pick a date and a time for the call.",
};

export default function BookingForm() {
  const detected = useSyncExternalStore(noSubscribe, readZone, () => "");
  const [picked, setPicked] = useState("");
  const tz = picked || detected;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [hp, setHp] = useState("");
  const [token, setToken] = useState("");

  const [cal, setCal] = useState<Calendar | null>(null);
  const [calError, setCalError] = useState(false);
  const [monthState, setMonthState] = useState("");
  const [date, setDate] = useState("");
  const [day, setDay] = useState<DayData | null>(null);
  const [dayError, setDayError] = useState(false);
  const [slot, setSlot] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<BookingSummary | null>(null);

  const initZone = useRef("");
  const dayToken = useRef(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const month = monthState || (cal ? monthOf(cal.today) : "");
  const monthLoaded = Boolean(cal && cal.months.includes(month));

  const loadMonth = useCallback(async (zone: string, m: string) => {
    const data = await fetchAvailability({ start: `${m}-01`, days: String(monthDays(m)), tz: zone, summary: "1" });
    if (initZone.current !== zone) return; // the visitor changed zone while this was loading
    if (!data) return setCalError(true);
    const counts: Record<string, number> = {};
    for (const [k, v] of Object.entries(data.summary)) counts[k] = v.open;
    setCal((prev) =>
      prev && prev.zone === zone
        ? { ...prev, counts: { ...prev.counts, ...counts }, months: [...prev.months, m] }
        : {
            zone,
            today: data.today,
            lastDate: data.lastDate,
            minutes: data.durationMinutes,
            counts,
            months: [m],
          }
    );
  }, []);

  const loadDay = useCallback(async (zone: string, key: string) => {
    const mine = ++dayToken.current;
    const data = await fetchAvailability({ start: key, days: "1", tz: zone });
    if (mine !== dayToken.current) return;
    if (!data) return setDayError(true);
    setDay({ zone, date: key, open: data.open || [], taken: data.taken || [] });
  }, []);

  // First load, and again after the visitor changes zone: the month that contains today in that zone.
  useEffect(() => {
    if (!tz || cal || calError || initZone.current === tz) return;
    initZone.current = tz;
    loadMonth(tz, monthOf(dateKeyInZone(tz, new Date())));
  }, [tz, cal, calError, loadMonth]);

  const resetTimes = () => {
    dayToken.current++;
    setCal(null);
    setCalError(false);
    setMonthState("");
    setDate("");
    setDay(null);
    setDayError(false);
    setSlot("");
    initZone.current = "";
  };

  function changeZone(zone: string) {
    if (zone === tz) return;
    setPicked(zone);
    resetTimes();
  }

  function changeMonth(m: string) {
    setMonthState(m);
    if (tz && cal && !cal.months.includes(m)) loadMonth(tz, m);
  }

  function pickDate(key: string) {
    setDate(key);
    setSlot("");
    setDay(null);
    setDayError(false);
    setErrors((x) => ({ ...x, slot: "" }));
    loadDay(tz, key);
  }

  const timeFormat = useMemo(
    () => (tz ? new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }) : null),
    [tz]
  );
  const fmtTime = (iso: string) => (timeFormat ? timeFormat.format(new Date(iso)) : iso);

  const dayReady = Boolean(day && day.date === date && day.zone === tz);
  const times = useMemo(() => {
    if (!day || day.date !== date || day.zone !== tz) return [];
    return [...day.open.map((iso) => ({ iso, taken: false })), ...day.taken.map((iso) => ({ iso, taken: true }))].sort((a, b) =>
      a.iso < b.iso ? -1 : 1
    );
  }, [day, date, tz]);
  const openCount = times.filter((t) => !t.taken).length;

  // Start the time list around 8 am local time so the useful hours are in view first.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !times.length || !timeFormat) return;
    const hourFormat = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" });
    const target = times.findIndex((t) => Number(hourFormat.format(new Date(t.iso))) >= 8);
    const button = grid.querySelectorAll<HTMLElement>("button")[Math.max(target, 0)];
    if (button) grid.scrollTop = Math.max(button.offsetTop - grid.offsetTop - 4, 0);
  }, [times, tz, timeFormat]);

  function toggleNeed(n: string) {
    setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));
    setErrors((x) => ({ ...x, needs: "" }));
  }

  function summaryFor(iso: string): BookingSummary {
    const when = new Date(iso);
    const abbr = zoneAbbreviation(tz, when);
    return {
      day: formatDay(dateKeyInZone(tz, when)),
      time: fmtTime(iso),
      zone: abbr && !isCommonZone(tz) ? `${zoneLabel(tz)}, ${abbr}` : zoneLabel(tz),
      minutes: cal?.minutes || 15,
      email: email.trim(),
      rows: [
        ["Company", company.trim()],
        ["Industry", industry],
        ["Needs", needs.join(", ")],
        ["Monthly budget", budget],
        ["Notes", notes.trim()],
      ].filter(([, v]) => v) as [string, string][],
    };
  }

  function focusField(key: string) {
    const id = { name: "book-name", email: "book-email", industry: "book-industry", needs: "book-need-0", budget: "book-budget", slot: "book-date" }[key];
    const el = id ? document.getElementById(id) : null;
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = FIELD_NAMES.name;
    if (!validEmail(email)) next.email = FIELD_NAMES.email;
    if (!industry) next.industry = FIELD_NAMES.industry;
    if (!needs.length) next.needs = FIELD_NAMES.needs;
    if (!budget) next.budget = FIELD_NAMES.budget;
    if (!slot) next.slot = date ? "Pick a time for the call." : FIELD_NAMES.slot;
    setErrors(next);
    setStatus("");
    const firstKey = ["name", "email", "industry", "needs", "budget", "slot"].find((k) => next[k]);
    if (firstKey) return focusField(firstKey);

    setBusy(true);
    const res = await postJson("/api/bookings", {
      name,
      email,
      company,
      industry,
      needs,
      budget,
      notes,
      slot,
      visitorTimezone: tz,
      website: hp,
      turnstileToken: token,
    });
    setBusy(false);
    if (res.ok) {
      setDone(summaryFor(slot));
      return;
    }
    if (res.error === "invalid_fields" && res.fields) {
      const server: Record<string, string> = {};
      for (const key of Object.keys(res.fields)) if (FIELD_NAMES[key]) server[key] = FIELD_NAMES[key];
      setErrors(server);
    }
    setStatus(errorText(res.error));
    if (res.error === "slot_unavailable") {
      setSlot("");
      if (date) loadDay(tz, date);
      if (month) loadMonth(tz, month);
    }
  }

  function retry() {
    resetTimes();
  }

  if (done) return <BookingSuccess summary={done} />;

  const zoneReady = Boolean(tz);
  const showTimes = Boolean(date) && !calError;
  const dayLoading = showTimes && !dayReady && !dayError;

  return (
    <form onSubmit={submit} noValidate className="bk">
      <section className="bk-step" aria-labelledby="bk-h1">
        <header className="bk-head">
          <span className="bk-eyebrow">Step 1 of 2</span>
          <h3 id="bk-h1">About you and what you need</h3>
        </header>
        <div className="stack">
          <div className="two">
            <Field id="book-name" label="Your name" error={errors.name}>
              <input
                id="book-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((x) => ({ ...x, name: "" }));
                }}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "book-name-err" : undefined}
              />
            </Field>
            <Field id="book-email" label="Work email" error={errors.email}>
              <input
                id="book-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((x) => ({ ...x, email: "" }));
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "book-email-err" : undefined}
              />
            </Field>
          </div>
          <div className="two">
            <Field id="book-company" label="Company name" optional>
              <input id="book-company" type="text" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field id="book-industry" label="Industry" error={errors.industry}>
              <select
                id="book-industry"
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  setErrors((x) => ({ ...x, industry: "" }));
                }}
                aria-invalid={Boolean(errors.industry)}
                aria-describedby={errors.industry ? "book-industry-err" : undefined}
              >
                <option value="">Select your industry</option>
                {bookingIndustryOptions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="field bk-needs" aria-describedby={errors.needs ? "book-needs-err" : "book-needs-hint"}>
            <legend>What do you need help with?</legend>
            <p className="bk-hint" id="book-needs-hint">
              Choose everything that applies.
            </p>
            <div className="chips">
              {bookingNeedOptions.map((n, i) => (
                <label key={n} className="chip">
                  <input id={`book-need-${i}`} type="checkbox" checked={needs.includes(n)} onChange={() => toggleNeed(n)} />
                  <span>{n}</span>
                </label>
              ))}
            </div>
            {errors.needs ? (
              <p className="err" id="book-needs-err">
                {errors.needs}
              </p>
            ) : null}
          </fieldset>

          <Field id="book-budget" label="Estimated monthly budget" error={errors.budget}>
            <select
              id="book-budget"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                setErrors((x) => ({ ...x, budget: "" }));
              }}
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={errors.budget ? "book-budget-err" : undefined}
            >
              <option value="">Select a range</option>
              {bookingBudgetOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

          <Field id="book-notes" label="Anything we should know before the call?" optional>
            <textarea id="book-notes" rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="bk-step bk-step--time" aria-labelledby="bk-h2">
        <header className="bk-head">
          <span className="bk-eyebrow">Step 2 of 2</span>
          <h3 id="bk-h2">Pick a time</h3>
          <p className="bk-hint">
            {cal?.minutes || 15} minute call. Open 24 hours a day, every day. Times are shown in the time zone you choose.
          </p>
        </header>

        <div className="stack">
          <div className="field">
            <label htmlFor="book-tz">Time zone</label>
            {zoneReady ? <TimeZoneSelect id="book-tz" value={tz} onChange={changeZone} extra={detected ? [detected] : []} /> : <div className="bk-skel bk-skel--field" aria-hidden="true" />}
          </div>

          {calError ? (
            <div className="slot-empty" role="alert">
              <p>
                Online booking is not available right now. Request an estimate on the other tab, or email{" "}
                <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> and we will arrange a time.
              </p>
              <button type="button" className="linkbtn" onClick={retry}>
                Try again
              </button>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="book-date">Date</label>
              {cal && month ? (
                <DatePicker
                  id="book-date"
                  value={date}
                  onChange={pickDate}
                  today={cal.today}
                  lastDate={cal.lastDate}
                  month={month}
                  onMonthChange={changeMonth}
                  counts={cal.counts}
                  loading={!monthLoaded}
                  invalid={Boolean(errors.slot) && !date}
                  describedBy={errors.slot ? "book-slot-err" : undefined}
                />
              ) : (
                <div className="bk-skel bk-skel--field" aria-hidden="true" />
              )}
            </div>
          )}

          {showTimes ? (
            <div className="bk-times" aria-busy={dayLoading}>
              <div className="bk-times-head">
                <h4 id="bk-times-h">Times on {formatDay(date)}</h4>
                <p className="bk-legend" aria-hidden="true">
                  <span className="bk-key" /> Booked
                </p>
              </div>
              {dayLoading ? (
                <div className="slots bk-skels" aria-label="Loading times" role="status">
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="bk-skel" />
                  ))}
                </div>
              ) : dayError ? (
                <p className="bk-empty" role="alert">
                  Could not load the times for this day.{" "}
                  <button type="button" className="linkbtn" onClick={() => pickDate(date)}>
                    Try again
                  </button>
                </p>
              ) : openCount === 0 ? (
                <p className="bk-empty">There are no open times on this day. Pick another date.</p>
              ) : (
                <div className="slots bk-slots" role="group" aria-labelledby="bk-times-h" ref={gridRef}>
                  {times.map((t) => (
                    <button
                      key={t.iso}
                      type="button"
                      className={t.taken ? "is-taken" : undefined}
                      disabled={t.taken}
                      aria-pressed={t.taken ? undefined : t.iso === slot}
                      aria-label={t.taken ? `${fmtTime(t.iso)}, already booked` : fmtTime(t.iso)}
                      onClick={() => {
                        setSlot(t.iso);
                        setErrors((x) => ({ ...x, slot: "" }));
                      }}
                    >
                      {fmtTime(t.iso)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {errors.slot ? (
            <p className="err" id="book-slot-err">
              {errors.slot}
            </p>
          ) : null}

          {slot ? (
            <p className="bk-picked" role="status">
              <span>Your call</span>
              {formatDay(dateKeyInZone(tz, new Date(slot)))} at {fmtTime(slot)}, {zoneLabel(tz)}
            </p>
          ) : null}
        </div>
      </section>

      <div className="stack bk-submit">
        <div className="hp" aria-hidden="true">
          <label htmlFor="book-website">Website</label>
          <input id="book-website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </div>
        <Turnstile onToken={setToken} />
        {status ? (
          <p className="form-status" role="alert">
            {status}
          </p>
        ) : null}
        <div className="form-foot">
          <button className="btn btn--amber" type="submit" disabled={busy || calError}>
            {busy ? "Booking" : "Book this time"}
          </button>
          <span className="consent">
            By booking you agree to our <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </div>
      </div>
    </form>
  );
}
