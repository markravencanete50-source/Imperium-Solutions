import type { Metadata } from "next";
import { CtaBand, PageHero, RelatedLinks } from "@/components/site/bits";
import Statement from "@/components/site/Statement";
import { About } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "About",
  description: "Imperium Solutions Inc. is a managed support company whose teams work from home on your hours.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Your growth partner"
        lede="Imperium Solutions runs customer support and back office teams for US and international businesses."
        image="var(--img-front)"
        imageAlt="A support headset with a microphone beside a laptop in a home office"
      />
      <About />
      <Statement />
      <RelatedLinks
        tone="raise"
        items={[
          { href: "/how-it-works", title: "How it works", text: "The same 90 day plan for every engagement." },
          { href: "/careers", title: "Careers", text: "Work from home with Imperium." },
        ]}
      />
      <CtaBand />
    </>
  );
}
