"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav } from "@/lib/content";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site-head${solid ? " is-solid" : ""}${open ? " is-open" : ""}`}>
      <div className="wrap head-row">
        <Link className="mark" href="/" aria-label="Imperium Solutions, home" onClick={close}>
          <span>Imperium</span>
          <span>Solutions</span>
        </Link>
        <nav className="nav" id="nav" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="head-cta">
          <Link className="btn btn--amber btn--small" href="/contact" onClick={close}>
            Book a consultation
          </Link>
          <button
            className="navbtn"
            type="button"
            aria-expanded={open}
            aria-controls="nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
