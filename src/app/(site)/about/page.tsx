import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { CtaBand, PageHero } from "@/components/site/bits";
import Statement from "@/components/site/Statement";
import { About } from "@/components/site/sections";

export const metadata: Metadata = pageMetadata("/about");

export default function Page() {
  return (
    <>
      <PageHero title="Your growth partner" lede="Imperium Solutions runs customer support and back office teams for US and international businesses." />
      <Breadcrumbs path="/about" />
      <About />
      <Statement />
      <CtaBand />
    </>
  );
}
