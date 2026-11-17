"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { industries, site, stats } from "@/lib/content";
import { CountUp, SwapText } from "./motion";

const DURATION = 3800; // time each industry stays on screen
const WIPE = 1200; // matches the clip-path transition in globals.css

const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export default function Hero() {
  // cur is -1 until the first photograph wipes in after mount.
  const [show, setShow] = useState({ cur: -1, prev: -1, entering: false, tick: 0 });
  const [playing, setPlaying] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLSpanElement>(null);

  const go = useCallback((i: number) => {
    setShow((s) => (i === s.cur ? s : { cur: i, prev: s.cur, entering: true, tick: s.tick + 1 }));
  }, []);

  // First photograph.
  useEffect(() => {
    const reduce = document.documentElement.classList.contains("reduce");
    const t = window.setTimeout(() => go(0), reduce ? 0 : 350);
    return () => window.clearTimeout(t);
  }, [go]);

  // Finish the wipe.
  useEffect(() => {
    if (show.tick === 0) return;
    const reduce = document.documentElement.classList.contains("reduce");
    const t = window.setTimeout(() => setShow((s) => ({ ...s, entering: false })), reduce ? 0 : WIPE);
    return () => window.clearTimeout(t);
  }, [show.tick]);

  // Move to the next industry.
  useEffect(() => {
    if (show.cur < 0 || !playing) return;
    if (document.documentElement.classList.contains("reduce")) return;
    const t = window.setTimeout(() => go((show.cur + 1) % industries.length), DURATION);
    return () => window.clearTimeout(t);
  }, [show.cur, show.tick, playing, go]);

  // Pause while the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    let visible = true;
    const update = () => setPlaying(visible && !document.hidden);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        update();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Keep the longest industry name on one line by scaling the rolling word.
  useEffect(() => {
    const rot = rotRef.current;
    if (!rot) return;
    const fit = () => {
      rot.style.fontSize = "";
      const base = parseFloat(getComputedStyle(rot).fontSize);
      const avail = rot.clientWidth;
      let widest = 0;
      rot.querySelectorAll<HTMLElement>("span").forEach((w) => (widest = Math.max(widest, w.offsetWidth)));
      if (avail > 0 && widest > avail) rot.style.fontSize = `${((base * avail) / widest) * 0.985}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const { cur, prev, entering, tick } = show;
  const active = cur < 0 ? 0 : cur;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-text">
          <h1 id="hero-title" aria-label="Managed support teams for every industry">
            <span className="line" aria-hidden="true">
              <span style={d(0.1)}>Managed support</span>
            </span>
            <span className="line" aria-hidden="true">
              <span style={d(0.22)}>teams for</span>
            </span>
            <span className="rot" ref={rotRef} aria-hidden="true">
              {industries.map((ind, i) => (
                <span key={ind.key} className={i === cur ? "is-on" : i === prev ? "is-out" : undefined}>
                  {ind.word}
                </span>
              ))}
            </span>
          </h1>
          <p className="lede" data-load="" style={d(0.5)}>
            Front office and back office, run for you. You set the responsibilities, coverage hours, and service
            standards. Imperium recruits, trains, supervises, and reports on the team.
          </p>
          <div className="actions" data-load="" style={d(0.62)}>
            <Link className="btn btn--amber" href="/contact">
              Book a 15 minute consultation
            </Link>
            <Link className="btn btn--ghost" href="/contact#estimate">
              Request an estimate
            </Link>
          </div>
          <div className="hero-index-wrap" data-load="" style={d(0.78)}>
            <p>We accept every industry. A few we know well</p>
            <div
              className="hero-index"
              role="group"
              aria-label="Choose the industry shown in the photo"
              style={{ "--dur": `${DURATION}ms` } as CSSProperties}
            >
              {industries.map((ind, i) => (
                <button
                  key={ind.key}
                  type="button"
                  className={i === cur ? "is-on" : undefined}
                  aria-pressed={i === cur}
                  onClick={() => go(i)}
                >
                  {ind.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-stage" ref={stageRef} aria-hidden="true">
          {industries.map((ind, i) => {
            let cls = "hero-layer";
            if (i === cur) cls += entering ? " is-entering is-live" : " is-on is-live";
            else if (i === prev && entering) cls += " is-on is-live";
            return (
              <div key={ind.key} className={cls}>
                <div className="hero-img" style={{ backgroundImage: ind.image }} />
              </div>
            );
          })}
          {tick > 0 ? <i key={tick} className="hero-wipe run" /> : null}
          <div className="hero-cap">
            <SwapText text={industries[active].name} />
            <small>
              {active + 1} of {industries.length}
            </small>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="hero-stats" aria-label="Upwork track record">
          {stats.map((s, i) => (
            <div className="stat" key={s.label} data-load="" style={d(0.9 + i * 0.08)}>
              {"text" in s ? (
                <span className="stat-n">{s.text}</span>
              ) : (
                <CountUp
                  className="stat-n"
                  value={s.value}
                  suffix={"suffix" in s ? s.suffix : ""}
                  plain={"plain" in s ? s.plain : false}
                  delayMs={1000}
                />
              )}
              <span className="stat-l">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="hero-stats-foot" data-load="" style={d(1.3)}>
          Every figure is public.{" "}
          <a className="textlink" href={site.upworkUrl} target="_blank" rel="noopener">
            Check them on our Upwork profile
          </a>
        </p>
      </div>
    </section>
  );
}
