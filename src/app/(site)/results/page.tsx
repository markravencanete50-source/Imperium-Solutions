import type { Metadata } from "next";
import { CtaBand, PageHero, RelatedLinks } from "@/components/site/bits";
import { Results, StatStrip } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "Results",
  description: "Documented Imperium engagements and hours from our Upwork track record.",
  alternates: { canonical: "/results" },
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Results you can check"
        lede="Every figure here comes from our public Upwork profile: 100% Job Success across 27 jobs."
        image="var(--img-h-saas)"
        imageAlt="Analytics dashboard with charts on a dark screen"
      />
      <section className="band band--raise statband" aria-label="Upwork track record">
        <div className="wrap">
          <StatStrip />
        </div>
      </section>
      <Results />
      <RelatedLinks
        tone="raise"
        items={[
          { href: "/industries", title: "Industries", text: "Where the work was delivered and where we are ready to start." },
          { href: "/how-it-works", title: "How it works", text: "What happens in the first 90 days." },
        ]}
      />
      <CtaBand />
    </>
  );
}
