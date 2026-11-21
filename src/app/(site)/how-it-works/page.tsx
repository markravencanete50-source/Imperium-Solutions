import type { Metadata } from "next";
import { CtaBand, PageHero, RelatedLinks } from "@/components/site/bits";
import Timeline from "@/components/site/Timeline";
import { Model, Needs } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "How it works",
  description: "How an Imperium engagement runs: what you define, what we manage, and the first 90 days.",
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return (
    <>
      <PageHero
        title="A managed operation in 90 days"
        lede="You set the standards. We staff, train, launch, and report, following the same plan every time."
        image="var(--img-model)"
        imageAlt="Headphones and a laptop on a desk"
      />
      <Timeline />
      <Model />
      <Needs tone="raise" />
      <RelatedLinks
        items={[
          { href: "/services", title: "Services", text: "Front office and back office work we run." },
          { href: "/results", title: "Results", text: "Engagements on record, with hours and ratings." },
        ]}
      />
      <CtaBand />
    </>
  );
}
