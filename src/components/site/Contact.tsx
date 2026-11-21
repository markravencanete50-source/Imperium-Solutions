"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { IconLine, Rise } from "./bits";
import BookingForm from "./BookingForm";
import { Field, Turnstile, errorText, postJson, validEmail } from "./formKit";

type Tab = "book" | "estimate";

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
          <ul className="plain il-list">
            <IconLine icon="users">Staffing and responsibilities</IconLine>
            <IconLine icon="clipboard">Onboarding and reporting</IconLine>
            <IconLine icon="chart">Pricing for your scope</IconLine>
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
