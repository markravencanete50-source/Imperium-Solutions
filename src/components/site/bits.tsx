import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

// Small server components shared by the page sections.

const delay = (ms?: number) => (ms ? ({ "--d": `${ms}ms` } as CSSProperties) : undefined);

/** Heading that rises out of a mask when it scrolls into view. */
export function Rise({
  as: Tag = "h2",
  id,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  id?: string;
  children: ReactNode;
}) {
  return (
    <Tag id={id} data-reveal="rise">
      <span className="rise-in">{children}</span>
    </Tag>
  );
}

export function SectionHead({ id, title, lede }: { id?: string; title: string; lede?: string }) {
  return (
    <div className="sec-head">
      <Rise id={id}>{title}</Rise>
      {lede ? (
        <p data-reveal="" style={delay(120)}>
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/** Photograph that wipes in, settles, then drifts with the scroll. */
export function Photo({ image, alt, delayMs }: { image: string; alt: string; delayMs?: number }) {
  return (
    <div className="ph" data-reveal="wipe" data-parallax-frame="" role="img" aria-label={alt} style={delay(delayMs)}>
      <div className="ph-zoom">
        <div className="ph-img" data-parallax="7.5" style={{ backgroundImage: image }} />
      </div>
    </div>
  );
}

/** List whose rows arrive one after another. */
export function RevealList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`plain${className ? ` ${className}` : ""}`}>
      {items.map((item, i) => (
        <li key={item} data-reveal="" style={delay(i * 75)}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PageHero({ title, lede }: { title: string; lede: string }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <h1>{title}</h1>
        <p>{lede}</p>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="cta-band" aria-label="Get started">
      <div className="wrap">
        <h2>Ready to delegate?</h2>
        <div className="actions">
          <Link className="btn btn--ink" href="/contact">
            Book a 15 minute consultation
          </Link>
          <Link className="btn btn--ghost" href="/contact#estimate">
            Request an estimate
          </Link>
        </div>
      </div>
    </section>
  );
}
