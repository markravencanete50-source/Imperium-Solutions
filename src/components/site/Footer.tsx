import Link from "next/link";
import { photoCredits, site } from "@/lib/content";

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
          <nav aria-label="Services and information">
            <h3>Services and information</h3>
            <ul className="plain">
              <li>
                <Link href="/services">Services</Link>
              </li>
              <li>
                <Link href="/how-it-works">How it works</Link>
              </li>
              <li>
                <Link href="/results">Results</Link>
              </li>
              <li>
                <Link href="/testimonials">Testimonials</Link>
              </li>
              <li>
                <Link href="/industries">Industries</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3>Company</h3>
            <ul className="plain">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact and consultations</Link>
              </li>
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
          </nav>
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
