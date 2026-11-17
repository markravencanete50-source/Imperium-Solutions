"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";

async function fetchSlots(): Promise<string[]> {
  try {
    const res = await fetch("/api/availability", { cache: "no-store" });
    const data = (await res.json()) as { slots?: string[] };
    return res.ok && Array.isArray(data.slots) ? data.slots : [];
  } catch {
    return [];
  }
}

const noSubscribe = () => () => {};
const readZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
};
import Link from "next/link";
import { site } from "@/lib/content";
import { Rise } from "./bits";

type Tab = "book" | "estimate";
type SlotState = "loading" | "ready" | "unavailable";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; theme?: string }) => string;
      reset: (id?: string) => void;
    };
  }
}

/** Cloudflare Turnstile. Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. */
function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    const el = ref.current;
    let cancelled = false;
    const render = () => {
      if (!cancelled && window.turnstile && !el.hasChildNodes()) {
        window.turnstile.render(el, { sitekey: SITE_KEY, callback: onToken, theme: "dark" });
      }
    };
    if (window.turnstile) render();
    else {
      let script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.dataset.turnstile = "1";
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }
    return () => {
      cancelled = true;
    };
  }, [onToken]);
  return SITE_KEY ? <div ref={ref} /> : null;
}

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function errorText(code: string | undefined): string {
  switch (code) {
    case "not_configured":
      return `This form is not connected yet. Please email ${site.contactEmail}.`;
    case "slot_unavailable":
      return "That time was just taken. Pick another time.";
    case "spam_check_failed":
      return "The spam check did not pass. Reload the page and try again.";
    case "invalid_fields":
      return "Some details look wrong. Check the fields and try again.";
    default:
      return `Something went wrong on our side. Try again, or email ${site.contactEmail}.`;
  }
}

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true } : { ok: false, error: data.error || "server_error" };
  } catch {
    return { ok: false, error: "network" };
  }
}

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {optional ? <em>(optional)</em> : null}
      </label>
      {children}
      {error ? (
        <p className="err" id={`${id}-err`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function BookingForm() {
  const [state, setState] = useState<SlotState>("loading");
  const [slots, setSlots] = useState<string[]>([]);
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const tz = useSyncExternalStore(noSubscribe, readZone, () => "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const apply = useCallback((list: string[]) => {
    setSlots(list);
    setState(list.length ? "ready" : "unavailable");
  }, []);
  const load = useCallback(async () => apply(await fetchSlots()), [apply]);

  useEffect(() => {
    let live = true;
    fetchSlots().then((list) => {
      if (live) apply(list);
    });
    return () => {
      live = false;
    };
  }, [apply]);

  // Group the UTC slots by the visitor's own calendar day.
  const days = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const iso of slots) {
      const key = new Date(iso).toLocaleDateString("en-CA");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(iso);
    }
    return Array.from(map.entries()).slice(0, 8);
  }, [slots]);

  const activeDay = days.find(([k]) => k === day)?.[0] ?? days[0]?.[0] ?? "";
  const times = days.find(([k]) => k === activeDay)?.[1] ?? [];
  const tzLabel = tz ? tz.replace(/_/g, " ") : "your time zone";

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const fmtLong = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!slot) next.slot = "Pick a time for the call.";
    if (!name.trim()) next.name = "Enter your name.";
    if (!validEmail(email)) next.email = "Enter an email address like name@company.com.";
    setErrors(next);
    setStatus("");
    if (Object.keys(next).length) return;

    setBusy(true);
    const res = await postJson("/api/bookings", {
      name,
      email,
      slot,
      visitorTimezone: tz,
      website: hp,
      turnstileToken: token,
    });
    setBusy(false);
    if (res.ok) {
      setDone(fmtLong(slot));
      return;
    }
    setStatus(errorText(res.error));
    if (res.error === "slot_unavailable") {
      setSlot("");
      load();
    }
  }

  if (done) {
    return (
      <div className="done" role="status">
        <h3>Your consultation is booked.</h3>
        <p>
          We will speak on {done} ({tzLabel}). We will email the meeting details to {email.trim()}.
        </p>
        <p>Need to change it? Email {site.contactEmail}.</p>
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div className="slot-empty">
        <p>
          Online booking is not available right now. Request an estimate on the other tab, or email{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> and we will arrange a time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <h3 id="day-label">Pick a day</h3>
      <div className="days" role="group" aria-labelledby="day-label">
        {state === "loading" ? (
          <p className="hint">Loading open times.</p>
        ) : (
          days.map(([key, list]) => {
            const d = new Date(list[0]);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={key === activeDay}
                onClick={() => {
                  setDay(key);
                  setSlot("");
                }}
              >
                {d.toLocaleDateString("en-US", { weekday: "short" })}
                <span>{d.toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
              </button>
            );
          })
        )}
      </div>

      <h3 id="slot-label" style={{ marginTop: 26 }}>
        Pick a time
      </h3>
      <p className="hint">15 minutes, shown in your time zone ({tzLabel}).</p>
      <div className="slots" role="group" aria-labelledby="slot-label">
        {times.map((iso) => (
          <button
            key={iso}
            type="button"
            aria-pressed={iso === slot}
            onClick={() => {
              setSlot(iso);
              setErrors((x) => ({ ...x, slot: "" }));
            }}
          >
            {fmtTime(iso)}
          </button>
        ))}
      </div>
      {errors.slot ? <p className="err">{errors.slot}</p> : null}

      <div className="stack">
        <div className="two">
          <Field id="book-name" label="Your name" error={errors.name}>
            <input
              id="book-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
          </Field>
          <Field id="book-email" label="Work email" error={errors.email}>
            <input
              id="book-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
          </Field>
        </div>
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
          <button className="btn btn--amber" type="submit" disabled={busy}>
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

function EstimateForm() {
  const [step, setStep] = useState(1);
  const [v, setV] = useState({
    name: "",
    email: "",
    company: "",
    need: "",
    side: "",
    coverage: "",
    teamSize: "",
    startDate: "",
    website: "",
  });
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  function checkStepOne() {
    const next: Record<string, string> = {};
    if (!v.name.trim()) next.name = "Enter your name.";
    if (!validEmail(v.email)) next.email = "Enter an email address like name@company.com.";
    if (!v.company.trim()) next.company = "Enter your company name.";
    if (!v.need.trim()) next.need = "Tell us a little about the work.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (checkStepOne()) setStep(2);
      return;
    }
    setBusy(true);
    setStatus("");
    const res = await postJson("/api/leads", { ...v, turnstileToken: token });
    setBusy(false);
    if (res.ok) setDone(true);
    else setStatus(errorText(res.error));
  }

  if (done) {
    return (
      <div className="done" role="status">
        <h3>Your request is in.</h3>
        <p>
          Thank you, {v.name.trim()}. We will review what {v.company.trim()} needs and reply to {v.email.trim()} with an
          estimate.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      {step === 1 ? (
        <div className="step stack" style={{ marginTop: 0 }}>
          <div className="two">
            <Field id="est-name" label="Your name" error={errors.name}>
              <input id="est-name" type="text" autoComplete="name" value={v.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field id="est-email" label="Work email" error={errors.email}>
              <input id="est-email" type="email" autoComplete="email" value={v.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} />
            </Field>
          </div>
          <Field id="est-company" label="Company" error={errors.company}>
            <input id="est-company" type="text" autoComplete="organization" value={v.company} onChange={set("company")} aria-invalid={Boolean(errors.company)} />
          </Field>
          <Field id="est-need" label="What do you need help with?" error={errors.need}>
            <textarea id="est-need" value={v.need} onChange={set("need")} aria-invalid={Boolean(errors.need)} />
          </Field>
          <div className="hp" aria-hidden="true">
            <label htmlFor="est-website">Website</label>
            <input id="est-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
          </div>
          <div className="form-foot">
            <button className="btn btn--amber" type="submit">
              Continue
            </button>
            <span className="consent">Step 1 of 2</span>
          </div>
        </div>
      ) : (
        <div className="step">
          <h3>A few details for a closer estimate</h3>
          <p className="hint">All optional. Skip anything you do not know yet.</p>
          <div className="stack" style={{ marginTop: 0 }}>
            <div className="two">
              <Field id="est-side" label="Support needed" optional>
                <select id="est-side" value={v.side} onChange={set("side")}>
                  <option value="">Not sure yet</option>
                  <option>Front office</option>
                  <option>Back office</option>
                  <option>Both</option>
                </select>
              </Field>
              <Field id="est-coverage" label="Coverage" optional>
                <select id="est-coverage" value={v.coverage} onChange={set("coverage")}>
                  <option value="">Not sure yet</option>
                  <option>Business hours</option>
                  <option>Extended hours</option>
                  <option>Round the clock</option>
                </select>
              </Field>
            </div>
            <div className="two">
              <Field id="est-size" label="Team size" optional>
                <select id="est-size" value={v.teamSize} onChange={set("teamSize")}>
                  <option value="">Not sure yet</option>
                  <option>1 person</option>
                  <option>2 to 5 people</option>
                  <option>6 to 10 people</option>
                  <option>More than 10 people</option>
                </select>
              </Field>
              <Field id="est-start" label="Target start date" optional>
                <input id="est-start" type="date" value={v.startDate} onChange={set("startDate")} />
              </Field>
            </div>
            <Turnstile onToken={setToken} />
            {status ? (
              <p className="form-status" role="alert">
                {status}
              </p>
            ) : null}
            <div className="form-foot">
              <button className="btn btn--amber" type="submit" disabled={busy}>
                {busy ? "Sending" : "Request estimate"}
              </button>
              <button className="linkbtn" type="button" onClick={() => setStep(1)}>
                Back
              </button>
              <span className="consent">
                By sending you agree to our <Link href="/privacy">Privacy Policy</Link>.
              </span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

/** Contact section: book a consultation or request an estimate. Open on the estimate tab with /contact#estimate. */
export default function Contact() {
  const [tab, setTab] = useState<Tab>("book");

  useEffect(() => {
    const read = () => {
      if (window.location.hash === "#estimate") setTab("estimate");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <section className="band band--ink" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact">
        <div className="contact-intro">
          <Rise id="contact-title">Ready to delegate?</Rise>
          <p data-reveal="">Book a 15 minute consultation. We will discuss your needs and recommend a solution.</p>
          <ul className="plain">
            <li data-reveal="">Staffing and responsibilities</li>
            <li data-reveal="">Onboarding and reporting</li>
            <li data-reveal="">Pricing for your scope</li>
          </ul>
        </div>
        <div data-reveal="">
          <div className="tabs" role="tablist" aria-label="How to reach us">
            <button type="button" role="tab" id="tab-book" aria-controls="panel-book" aria-selected={tab === "book"} onClick={() => setTab("book")}>
              Book a consultation
            </button>
            <button type="button" role="tab" id="tab-estimate" aria-controls="panel-estimate" aria-selected={tab === "estimate"} onClick={() => setTab("estimate")}>
              Request an estimate
            </button>
          </div>
          <div className="panel" id="panel-book" role="tabpanel" aria-labelledby="tab-book" hidden={tab !== "book"}>
            <BookingForm />
          </div>
          <div className="panel" id="panel-estimate" role="tabpanel" aria-labelledby="tab-estimate" hidden={tab !== "estimate"}>
            <EstimateForm />
          </div>
        </div>
      </div>
    </section>
  );
}
