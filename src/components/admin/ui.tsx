"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

// Small building blocks shared by the admin pages.

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="adm-title">
      <div>
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>
      {children ? <div className="adm-actions">{children}</div> : null}
    </div>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="kpi">
      <span className="kpi-l">{label}</span>
      <span className="kpi-v">{value}</span>
      {hint ? <span className="kpi-h">{hint}</span> : null}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="panel-box">
      <header>
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Side sheet for viewing and editing one record. Closes on Escape. */
export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="drawer-wrap">
      <button className="drawer-scrim" type="button" aria-label="Close" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button className="abtn abtn--quiet" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}

export function AField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="afield">
      <span>{label}</span>
      {children}
    </label>
  );
}

/** A delete button that asks once before acting. */
export function ConfirmButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <span className="confirm">
      <button className="abtn abtn--danger" type="button" onClick={onConfirm}>
        Yes, {label.toLowerCase()}
      </button>
      <button className="abtn abtn--quiet" type="button" onClick={() => setArmed(false)}>
        Keep
      </button>
    </span>
  ) : (
    <button className="abtn abtn--quiet" type="button" onClick={() => setArmed(true)}>
      {label}
    </button>
  );
}

/**
 * Runs a write and keeps its failure for display. `run` resolves true when the write succeeded,
 * so callers only clear a form or close a drawer on success.
 */
export function useAction() {
  const [error, setError] = useState("");
  const run = useCallback(async (fn: () => Promise<unknown>, what = "Could not save"): Promise<boolean> => {
    setError("");
    try {
      await fn();
      return true;
    } catch (err) {
      setError(`${what}: ${err instanceof Error ? err.message : "something went wrong"}`);
      return false;
    }
  }, []);
  return { error, run, clear: () => setError("") };
}

/** The red message line shown when a write fails. */
export function ErrorNote({ message }: { message: string }) {
  return message ? (
    <p className="adm-error" role="alert">
      {message}
    </p>
  ) : null;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}

export function Pill({ value }: { value: string }) {
  return <span className={`pill pill--${value}`}>{value.replace(/_/g, " ")}</span>;
}

/** Vertical bars with the value written on each bar, so the chart reads without hovering. */
export function BarChart({ data, format }: { data: { label: string; value: number }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars" role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")}>
      {data.map((d) => (
        <div className="bar-col" key={d.label}>
          <span className="bar-val">{format(d.value)}</span>
          <span className="bar-fill" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
          <span className="bar-lab">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Horizontal rows with a count on each, for comparing categories. */
export function RowChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="rowchart">
      {data.map((d) => (
        <div className="rowchart-row" key={d.label}>
          <span className="rowchart-lab">{d.label}</span>
          <span className="rowchart-track">
            <span className="rowchart-fill" style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="rowchart-val">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
