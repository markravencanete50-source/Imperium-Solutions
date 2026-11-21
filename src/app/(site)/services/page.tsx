import type { Metadata } from "next";
import { CtaBand, PageHero, RelatedLinks } from "@/components/site/bits";
import Coverage from "@/components/site/Coverage";
import { Model, Services } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "Services",
  description: "Managed front office and back office teams: customer support, virtual assistance, administration, and project operations.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Front office and back office, managed for you"
        lede="Customer support, virtual assistance, and operations work, run by a team Imperium recruits, trains, and supervises."
        image="var(--img-about)"
        imageAlt="A home office desk with a monitor in front of a bay window"
      />
      <Services />
      <Model />
      <Coverage tone="raise" />
      <RelatedLinks
        items={[
          { href: "/how-it-works", title: "How it works", text: "The first 90 days, step by step." },
          { href: "/industries", title: "Industries", text: "Every industry accepted. See the work on record." },
        ]}
      />
      <CtaBand />
    </>
  );
}
