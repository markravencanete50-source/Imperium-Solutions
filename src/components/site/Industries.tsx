"use client";

import { useState } from "react";
import { industries } from "@/lib/content";
import { SectionHead } from "./bits";

/** Photographs side by side. The one you point at or tap opens to show the work we run there. */
export default function Industries() {
  const [open, setOpen] = useState(industries[0].key);

  return (
    <section className="band band--mist" id="industries" aria-labelledby="industries-title">
      <div className="wrap">
        <SectionHead
          id="industries-title"
          title="Every industry accepted"
          lede="The model stays the same whatever you sell. Open an industry to see the work we run there."
        />
        <div data-reveal="">
          <div className="acc">
            {industries.map((ind) => {
              const on = ind.key === open;
              return (
                <button
                  key={ind.key}
                  type="button"
                  className={`acc-item${on ? " is-on" : ""}`}
                  aria-expanded={on}
                  onClick={() => setOpen(ind.key)}
                  onFocus={() => setOpen(ind.key)}
                  onPointerEnter={(e) => {
                    // Hover opens on desktop only. Touch uses tap.
                    if (e.pointerType === "mouse" && window.innerWidth > 860) setOpen(ind.key);
                  }}
                >
                  <span className="acc-img" style={{ backgroundImage: ind.image }} />
                  <span className="acc-shade" />
                  <span className="acc-v" aria-hidden="true">
                    {ind.name}
                  </span>
                  <span className="acc-body">
                    <span className="acc-tag">{ind.tag}</span>
                    <span className="acc-name">{ind.name}</span>
                    <span className="acc-desc">{ind.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="ind-close" data-reveal="">
          Not on the list? Tell us the work and we will scope it.
        </p>
      </div>
    </section>
  );
}
