"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS, DEFAULT_BOOKING_SETTINGS, MAX_DAYS_AHEAD, type BookingSettings } from "@/lib/crm";
import { isValidZone } from "@/lib/time";
import { saveRecord } from "@/components/admin/data";
import { AField, PageTitle, Panel } from "@/components/admin/ui";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SettingsPage() {
  const [s, setS] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS);
  const [times, setTimes] = useState(DEFAULT_BOOKING_SETTINGS.times.join(", "));
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getDoc(doc(getDb(), COLLECTIONS.settings, "booking"))
      .then((snap) => {
        if (snap.exists()) {
          const merged = { ...DEFAULT_BOOKING_SETTINGS, ...(snap.data() as Partial<BookingSettings>) };
          setS(merged);
          setTimes(merged.times.join(", "));
        }
        // Only a successful read enables the form, so defaults can never overwrite real settings.
        setLoaded(true);
      })
      .catch((err) => setLoadError(`Could not load settings: ${err.message}`));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const list = times
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const bad = s.allDay ? undefined : list.find((t) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t));
    if (bad) return setMessage(`"${bad}" is not a time. Use 24 hour HH:MM, for example 09:30 or 14:00.`);
    if (!isValidZone(s.timezone)) return setMessage(`"${s.timezone}" is not a time zone. Use a name like America/New_York.`);
    if (!s.allDay && (!s.weekdays.length || !list.length)) return setMessage("Choose at least one day and one time.");
    if (!(s.durationMinutes >= 5 && s.durationMinutes <= 120)) return setMessage("Call length must be between 5 and 120 minutes.");
    if (!(s.daysAhead >= 1 && s.daysAhead <= MAX_DAYS_AHEAD)) {
      return setMessage(`${s.allDay ? "Days shown" : "Business days shown"} must be between 1 and ${MAX_DAYS_AHEAD}.`);
    }
    try {
      await saveRecord(COLLECTIONS.settings, "booking", { ...s, times: list.length ? list.sort() : DEFAULT_BOOKING_SETTINGS.times });
      setMessage("Saved. The website shows the new times straight away.");
    } catch (err) {
      setMessage(`Could not save settings: ${err instanceof Error ? err.message : "something went wrong"}`);
    }
  }

  const toggleDay = (d: number) =>
    setS((x) => ({
      ...x,
      weekdays: x.weekdays.includes(d) ? x.weekdays.filter((n) => n !== d) : [...x.weekdays, d].sort(),
    }));
  const num = (k: "daysAhead" | "minNoticeHours" | "durationMinutes") => (e: { target: { value: string } }) =>
    setS((x) => ({ ...x, [k]: Number(e.target.value) || 0 }));

  return (
    <>
      <PageTitle title="Settings" sub="Consultation availability and admin access." />
      {loadError ? <p className="adm-error">{loadError}</p> : null}
      <Panel title="Consultation availability">
        <form className="aform" onSubmit={submit}>
          <AField label="Time zone the times below are written in">
            <input value={s.timezone} onChange={(e) => setS({ ...s, timezone: e.target.value.trim() })} disabled={!loaded} />
          </AField>
          <label className="toggle-row">
            <input type="checkbox" checked={s.allDay} onChange={(e) => setS({ ...s, allDay: e.target.checked })} disabled={!loaded} />
            <span>
              <b>Open 24 hours</b>
              <small>
                Every {s.slotStepMinutes} minutes, every day of the week, in the time zone above. Turn this off to use the
                days and start times below instead.
              </small>
            </span>
          </label>
          <fieldset className="days-pick" disabled={!loaded || s.allDay}>
            <legend>Days</legend>
            {DAYS.map((name, d) => (
              <label key={name}>
                <input type="checkbox" checked={s.weekdays.includes(d)} onChange={() => toggleDay(d)} /> {name}
              </label>
            ))}
          </fieldset>
          <AField label="Start times, 24 hour, separated by commas">
            <textarea value={times} onChange={(e) => setTimes(e.target.value)} disabled={!loaded || s.allDay} />
          </AField>
          <div className="form-row">
            <AField label={s.allDay ? "Days shown" : "Business days shown"}>
              <input type="number" min="1" max={MAX_DAYS_AHEAD} value={s.daysAhead} onChange={num("daysAhead")} disabled={!loaded} />
            </AField>
            <AField label="Minimum notice in hours">
              <input type="number" min="0" max="168" value={s.minNoticeHours} onChange={num("minNoticeHours")} disabled={!loaded} />
            </AField>
            <AField label="Call length in minutes">
              <input type="number" min="5" max="120" value={s.durationMinutes} onChange={num("durationMinutes")} disabled={!loaded} />
            </AField>
          </div>
          <div className="drawer-actions">
            <button className="abtn abtn--primary" type="submit" disabled={!loaded}>
              Save availability
            </button>
            {message ? <span className="saved">{message}</span> : null}
          </div>
        </form>
      </Panel>

      <Panel title="Admin access">
        <p>
          Invite people, block them, or remove their access on the <Link href="/admin/team">Team</Link> page.
        </p>
      </Panel>
    </>
  );
}
