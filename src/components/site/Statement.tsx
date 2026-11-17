"use client";

import { useEffect, useRef } from "react";

const TEXT = "You focus on growing your business. Imperium manages the support operation.";

/** A closing statement whose words light up as the visitor scrolls through it. */
export default function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = TEXT.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.classList.contains("reduce")) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>(".w"));
    let ticking = false;
    const draw = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.88 - r.top) / (vh * 0.5 + r.height * 0.5)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("lit", i < lit));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(draw);
      }
    };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="statement" data-parallax-frame="" aria-label="Our promise">
      <div className="st-bg" data-parallax="9" style={{ backgroundImage: "var(--img-model)" }} />
      <div className="wrap">
        <p className="st-text" ref={ref}>
          {words.map((w, i) => (
            <span key={i}>
              <span className={`w${w.startsWith("Imperium") ? " amber" : ""}`}>{w}</span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
