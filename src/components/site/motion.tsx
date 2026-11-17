"use client";

import { useEffect, useRef, useState } from "react";

// Small client side motion pieces: counting figures and text that rolls when it changes.

function prefersReduce() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("reduce");
}

/** A figure that counts up the first time it scrolls into view. Renders the final value on the server. */
export function CountUp({
  value,
  suffix = "",
  plain = false,
  delayMs = 150,
  className,
}: {
  value: number;
  suffix?: string;
  plain?: boolean;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => (plain ? String(n) : n.toLocaleString("en-US")) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduce() || !("IntersectionObserver" in window)) return;
    let raf = 0;
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          const start = plain ? value - 60 : 0;
          const t0 = performance.now();
          const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / 1600);
            const e = 1 - Math.pow(1 - k, 4);
            const v = Math.round(start + (value - start) * e);
            el.textContent = (plain ? String(v) : v.toLocaleString("en-US")) + suffix;
            if (k < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, delayMs);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [value, suffix, plain, delayMs]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {format(value)}
    </span>
  );
}

/** Text that rolls to its new value. */
export function SwapText({ text, className, id }: { text: string; className?: string; id?: string }) {
  const [state, setState] = useState({ cur: text, old: null as string | null, n: 0 });

  if (text !== state.cur) {
    // Derive during render so the old and new values swap in the same frame.
    setState({ cur: text, old: state.cur, n: state.n + 1 });
  }

  return (
    <span className={`swap${className ? ` ${className}` : ""}`} id={id}>
      {state.old !== null ? (
        <span key={`o${state.n}`} className="s-out" aria-hidden="true">
          {state.old}
        </span>
      ) : null}
      <span key={`i${state.n}`} className={state.n ? "s-in" : undefined}>
        {state.cur}
      </span>
    </span>
  );
}
