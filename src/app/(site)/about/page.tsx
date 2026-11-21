import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { CtaBand, PageHero, RelatedLinks } from "@/components/site/bits";
import Statement from "@/components/site/Statement";
import { About } from "@/components/site/sections";

export const metadata: Metadata = pageMetadata("/about");

export default function Page() {
  return (
    <>
      <PageHero
        title="Your growth partner"
        lede="Imperium Solutions runs customer support and back office teams for US and international businesses."
        image="var(--img-front)"
        imageAlt="A support headset with a microphone beside a laptop in a home office"
      />
      <Breadcrumbs path="/about" />
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
