"use client";

import { useEffect, useRef } from "react";
import { SectionHead } from "./bits";
import { Icon, type IconName } from "./icons";

const stages: { to: number; days: string; title: string; text: string; icon: IconName }[] = [
  {
    to: 30,
    days: "Days 1 to 30",
    title: "Launch",
    icon: "flag",
    text: "Define requirements, staff, train, go live, set KPIs.",
  },
  {
    to: 60,
    days: "Days 31 to 60",
    title: "Stabilize",
    icon: "refresh",
    text: "Monitor quality, coach the team, improve workflows.",
  },
  {
    to: 90,
    days: "Days 61 to 90",
    title: "Review",
    icon: "chart",
    text: "Review performance with you and recommend changes or expansion.",
  },
];

/** The 90 day plan. The line draws with the scroll and each number fills in as it is reached. */
export default function Timeline() {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const tl = ref.current;
    if (!tl) return;
    const items = Array.from(tl.querySelectorAll<HTMLLIElement>("li"));
    const reduce = document.documentElement.classList.contains("reduce");
    let ticking = false;

    const runNumber = (el: HTMLElement) => {
      const end = Number(el.dataset.to);
      const from = end - 30;
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = String(Math.round(from + (end - from) * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const draw = () => {
      ticking = false;
      let p = 1;
      if (!reduce) {
        const r = tl.getBoundingClientRect();
        const vh = window.innerHeight;
        p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.12)));
      }
      tl.style.setProperty("--p", p.toFixed(3));
      items.forEach((li, i) => {
        const on = p >= i / 3 + 0.015;
        if (on && !li.classList.contains("is-on") && !reduce) {
          const num = li.querySelector<HTMLElement>(".tl-num");
          if (num) runNumber(num);
        }
        li.classList.toggle("is-on", on);
      });
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
    <section className="band band--raise" id="how-it-works" aria-labelledby="how-title">
      <div className="wrap">
        <SectionHead
          id="how-title"
          title="The first 90 days"
          lede="Every engagement follows the same plan, so you know what happens and when."
        />
        <ol className="plain tl" ref={ref}>
          {stages.map((s) => (
            <li key={s.to} className="tile">
              <div className="tl-top">
                <div className="tl-num" data-to={s.to} suppressHydrationWarning>
                  {s.to}
                </div>
                <Icon name={s.icon} size={28} />
              </div>
              <div className="tl-days">{s.days}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="note">Timelines depend on project scope and staffing requirements.</p>
      </div>
    </section>
  );
}
