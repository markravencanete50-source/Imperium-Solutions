"use client";

import { useEffect, useRef } from "react";
import { marqueeIndustries, marqueeServices } from "@/lib/content";

function Track({ items }: { items: string[] }) {
  return (
    <div className="mq-track">
      {items.map((t, i) => (
        <span key={`${t}-${i}`}>{t}</span>
      ))}
    </div>
  );
}

/** Two lines of moving type. They drift on their own and speed up with the scroll. */
export default function Marquee() {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const services = [...marqueeServices, ...marqueeServices];

  useEffect(() => {
    const rowA = a.current;
    const rowB = b.current;
    if (!rowA || !rowB || document.documentElement.classList.contains("reduce")) return;
    let wA = 0;
    let wB = 0;
    let ticking = false;
    const measure = () => {
      wA = (rowA.firstElementChild as HTMLElement).offsetWidth;
      wB = (rowB.firstElementChild as HTMLElement).offsetWidth;
    };
    const draw = () => {
      ticking = false;
      if (!wA || !wB) return;
      const y = window.scrollY;
      rowA.style.transform = `translate3d(${(-((y * 0.45) % wA)).toFixed(1)}px,0,0)`;
      rowB.style.transform = `translate3d(${(((y * 0.3) % wB) - wB).toFixed(1)}px,0,0)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(draw);
      }
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    draw();
    document.fonts?.ready.then(onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="marquee" aria-hidden="true">
      <div className="mq-row" ref={a}>
        <Track items={marqueeIndustries} />
        <Track items={marqueeIndustries} />
        <Track items={marqueeIndustries} />
      </div>
      <div className="mq-row mq-row--rev" ref={b}>
        <Track items={services} />
        <Track items={services} />
        <Track items={services} />
      </div>
    </div>
  );
}
