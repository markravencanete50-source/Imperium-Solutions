import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/site/bits";
import Industries from "@/components/site/Industries";
import Marquee from "@/components/site/Marquee";

export const metadata: Metadata = {
  title: "Industries",
  description: "Imperium accepts every industry, including real estate, healthcare, property management, ecommerce, fintech, education, and software.",
  alternates: { canonical: "/industries" },
};

export default function Page() {
  return (
    <>
      <PageHero title="Support teams for every industry" lede="Real estate, healthcare, property management, ecommerce, and more. The managed model stays the same whatever you sell." />
      <Industries />
      <Marquee />
      <CtaBand />
    </>
  );
}
