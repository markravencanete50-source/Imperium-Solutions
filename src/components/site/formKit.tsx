"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/content";

// Small pieces shared by the booking form and the estimate form.

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
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
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

export const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function errorText(code: string | undefined): string {
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

export type PostResult = { ok: boolean; error?: string; fields?: Record<string, string[]> };

export async function postJson(url: string, body: unknown): Promise<PostResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string[]> };
    return res.ok ? { ok: true } : { ok: false, error: data.error || "server_error", fields: data.fields };
  } catch {
    return { ok: false, error: "network" };
  }
}

export function Field({
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
