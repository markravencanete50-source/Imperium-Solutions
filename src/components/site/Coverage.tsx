"use client";

import { useEffect, useState } from "react";
import { coverageMarkets, coverageWindows, site } from "@/lib/content";
import { formatHour, zoneOffsetMinutes, zoneParts } from "@/lib/time";
import { SectionHead } from "./bits";
import { SwapText } from "./motion";

const pad = (n: number) => (n < 10 ? "0" : "") + n;

/** Six rolling digits. Each column slides to its number. */
function Clock({ hour, minute, second }: { hour: number; minute: number; second: number }) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const digits = (pad(h12) + pad(minute) + pad(second)).split("").map(Number);
  const column = (n: number, key: number) => (
    <span className="od" key={key}>
      <i style={{ transform: `translateY(-${n * 10}%)` }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => (
          <b key={x}>{x}</b>
        ))}
      </i>
    </span>
  );
  return (
    <div className="clock" aria-hidden="true">
      {column(digits[0], 0)}
      {column(digits[1], 1)}
      <span className="sep">:</span>
      {column(digits[2], 2)}
      {column(digits[3], 3)}
      <span className="sep">:</span>
      {column(digits[4], 4)}
      {column(digits[5], 5)}
      <span className="ampm">{hour < 12 ? "am" : "pm"}</span>
    </div>
  );
}

/** Maps the client's coverage window onto the team's shift, with live clocks for both cities. */
export default function Coverage({ tone = "ink" }: { tone?: "ink" | "raise" }) {
  const [market, setMarket] = useState(coverageMarkets[0]);
  const [win, setWin] = useState(coverageWindows[0]);
  // The clock starts after mount so server and browser never disagree about the time.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const full = win.id === "full";
  // Before the clock starts, assume New York winter time so the first paint has real text.
  const diff = now ? (zoneOffsetMinutes(site.teamZone, now) - zoneOffsetMinutes(market.zone, now)) / 60 : 13;
  const clientWindow = full ? "Every hour" : `${formatHour(win.from)} to ${formatHour(win.to)}`;
  const teamWindow = full
    ? "covered in rotating shifts"
    : `${formatHour(win.from + diff)} to ${formatHour(win.to + diff)}`;

  const client = now ? zoneParts(market.zone, now) : null;
  const team = now ? zoneParts(site.teamZone, now) : null;
  const isDay = (h: number) => h >= 6 && h < 18;

  return (
    <section className={`band ${tone === "raise" ? "band--raise" : "band--ink"}`} id="coverage" aria-labelledby="coverage-title">
      <div className="wrap">
        <SectionHead
          id="coverage-title"
          title="Your hours, our shift"
          lede="Pick your market and the coverage you need. The team works the matching shift from the Philippines."
        />
        <div className="cov-controls" data-reveal="">
          <div>
            <h3 id="cov-market-label">Your market</h3>
            <div className="seg" role="group" aria-labelledby="cov-market-label">
              {coverageMarkets.map((m) => (
                <button key={m.id} type="button" aria-pressed={m.id === market.id} onClick={() => setMarket(m)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 id="cov-window-label">Coverage</h3>
            <div className="seg" role="group" aria-labelledby="cov-window-label">
              {coverageWindows.map((w) => (
                <button key={w.id} type="button" aria-pressed={w.id === win.id} onClick={() => setWin(w)}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="cov-line" data-reveal="" aria-hidden="true">
          <SwapText text={clientWindow} /> in <SwapText text={market.city} /> is{" "}
          <SwapText className="hl" text={teamWindow} /> in {site.teamCity}.
        </p>
        <p className="sr-only" aria-live="polite">
          {clientWindow} in {market.city} is {teamWindow} in {site.teamCity}.
        </p>

        <div className="cov-split" data-reveal="">
          <div className={`cov-half${client && isDay(client.hour) ? " is-day" : ""}`}>
            <p className="cov-city">
              Your day in <SwapText text={market.city} />
            </p>
            <p className="cov-phase">{client ? (isDay(client.hour) ? "Daytime there now" : "Night there now") : " "}</p>
            <Clock hour={client?.hour ?? 0} minute={client?.minute ?? 0} second={client?.second ?? 0} />
            <p className="cov-win">
              <small>Your coverage</small>
              <SwapText text={full ? "All 24 hours" : clientWindow} />
            </p>
          </div>
          <div className={`cov-half${team && isDay(team.hour) ? " is-day" : ""}`}>
            <p className="cov-city">The team&apos;s shift in {site.teamCity}</p>
            <p className="cov-phase">{team ? (isDay(team.hour) ? "Daytime there now" : "Night there now") : " "}</p>
            <Clock hour={team?.hour ?? 0} minute={team?.minute ?? 0} second={team?.second ?? 0} />
            <p className="cov-win">
              <small>Our shift</small>
              <SwapText text={full ? "Rotating shifts, all 24 hours" : teamWindow} />
            </p>
          </div>
        </div>
        <p className="note">Example coverage windows. Yours are written into the service standards before launch.</p>
      </div>
    </section>
  );
}
