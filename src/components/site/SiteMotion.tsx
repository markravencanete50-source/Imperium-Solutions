"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Wires the page wide motion after each navigation:
 * scroll reveals ([data-reveal] gets data-in), photo parallax ([data-parallax]),
 * and the hero entrance (body.is-ready).
 * Hidden states live in globals.css and only apply when scripts run.
 */
export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = document.documentElement.classList.contains("reduce");
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])"));
    let io: IntersectionObserver | null = null;

    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.setAttribute("data-in", ""));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.setAttribute("data-in", "");
              io?.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      reveals.forEach((el) => io!.observe(el));
    }

    const pars = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let ticking = false;
    const draw = () => {
      ticking = false;
      const vh = window.innerHeight;
      pars.forEach((el) => {
        const frame = el.closest<HTMLElement>("[data-parallax-frame]") ?? el.parentElement;
        if (!frame) return;
        const r = frame.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        const amount = Number(el.dataset.parallax) || 7.5;
        el.style.transform = `translate3d(0,${(p * -amount).toFixed(2)}%,0)`;
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(draw);
      }
    };
    if (!reduce && pars.length) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      draw();
    }

    let done = false;
    const ready = () => {
      if (!done) {
        done = true;
        document.body.classList.add("is-ready");
      }
    };
    const timer = window.setTimeout(ready, 900);
    if (document.fonts?.ready) document.fonts.ready.then(ready);
    else ready();

    return () => {
      io?.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
