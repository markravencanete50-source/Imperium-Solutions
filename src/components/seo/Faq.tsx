import { SectionHead } from "@/components/site/bits";
import { homeFaq } from "@/lib/seo/faq";
import { faqNode } from "@/lib/seo/schema";
import JsonLd from "./JsonLd";

/** Visible FAQ (details and summary, fully server rendered) with matching FAQPage JSON-LD. */
export default function Faq() {
  return (
    <section className="band band--mist" id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <SectionHead id="faq-title" title="Common questions" lede="Short answers before you book a call." />
        <div className="faq">
          {homeFaq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd data={faqNode(homeFaq, "/")} />
    </section>
  );
}
