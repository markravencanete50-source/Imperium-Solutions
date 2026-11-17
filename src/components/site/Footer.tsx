import Link from "next/link";
import { nav, photoCredits, site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-mark">
            <Link className="mark" href="/" aria-label="Imperium Solutions, home">
              <span>Imperium</span>
              <span>Solutions</span>
            </Link>
            <p>{site.tagline}</p>
          </div>
          <div>
            <h3>Site</h3>
            <ul className="plain">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/careers">Careers</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <a href={site.upworkUrl} target="_blank" rel="noopener">
                  Upwork profile
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Photo credits</h3>
            <ul className="plain credits">
              {photoCredits.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target="_blank" rel="noopener">
                    {c.label}
                  </a>
                  , {c.by}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="legal">
          Copyright {site.copyrightYear} {site.legalName} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
