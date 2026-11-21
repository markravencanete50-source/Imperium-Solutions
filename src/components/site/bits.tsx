import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./icons";

// Small server components shared by the page sections.

export const delay = (ms?: number) => (ms ? ({ "--d": `${ms}ms` } as CSSProperties) : undefined);

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
        <div className="ph-img" data-parallax="6" style={{ backgroundImage: image }} />
      </div>
    </div>
  );
}

/** A short line with an outline icon. Used inside tiles. */
export function IconLine({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <li className="il">
      <Icon name={icon} size={22} />
      <span>{children}</span>
    </li>
  );
}

/** Hero for the inner pages: the title, one line, the next step, and a photograph. */
export function PageHero({
  title,
  lede,
  image,
  imageAlt,
  actions = "book",
}: {
  title: string;
  lede: string;
  image?: string;
  imageAlt?: string;
  actions?: "book" | "none";
}) {
  return (
    <section className={`page-hero${image ? " has-img" : ""}`}>
      <div className="wrap page-hero-grid">
        <div className="page-hero-text">
          <h1>{title}</h1>
          <p>{lede}</p>
          {actions === "book" ? (
            <div className="actions">
              <Link className="btn btn--amber" href="/contact">
                Book a 15 minute consultation
              </Link>
              <Link className="btn btn--ghost" href="/contact#estimate">
                Request an estimate
              </Link>
            </div>
          ) : null}
        </div>
        {image ? (
          <div className="page-hero-img">
            <Photo image={image} alt={imageAlt ?? ""} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** One or two links to the pages a visitor is most likely to want next. */
export function RelatedLinks({
  items,
  tone = "ink",
}: {
  items: { href: string; title: string; text: string }[];
  tone?: "ink" | "raise";
}) {
  return (
    <section className={`band related${tone === "raise" ? " band--raise" : ""}`} aria-label="Related pages">
      <div className="wrap">
        <ul className="plain related-grid">
          {items.map((it, i) => (
            <li key={it.href} data-reveal="" style={delay(i * 90)}>
              <Link className="related-card" href={it.href}>
                <span className="related-title">{it.title}</span>
                <span className="related-text">{it.text}</span>
                <Icon name="arrow" size={22} className="related-arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="cta-band" aria-label="Get started">
      <div className="wrap">
        <div>
          <h2>Ready to delegate?</h2>
          <p>Tell us what you need. A 15 minute call is enough to start.</p>
        </div>
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
