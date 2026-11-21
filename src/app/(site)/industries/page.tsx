import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { CtaBand, PageHero } from "@/components/site/bits";
import Industries from "@/components/site/Industries";
import Marquee from "@/components/site/Marquee";

export const metadata: Metadata = pageMetadata("/industries");

export default function Page() {
  return (
    <>
      <PageHero title="Support teams for every industry" lede="Real estate, healthcare, property management, ecommerce, and more. The managed model stays the same whatever you sell." />
      <Breadcrumbs path="/industries" />
      <Industries />
      <Marquee />
      <CtaBand />
    </>
  );
}
