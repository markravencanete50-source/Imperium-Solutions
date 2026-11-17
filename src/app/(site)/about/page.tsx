import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/site/bits";
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
      <PageHero title="Your growth partner" lede="Imperium Solutions runs customer support and back office teams for US and international businesses." />
      <About />
      <Statement />
      <CtaBand />
    </>
  );
}
