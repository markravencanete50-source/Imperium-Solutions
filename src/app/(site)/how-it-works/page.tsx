import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { CtaBand, PageHero } from "@/components/site/bits";
import Timeline from "@/components/site/Timeline";
import { Model } from "@/components/site/sections";

export const metadata: Metadata = pageMetadata("/how-it-works");

export default function Page() {
  return (
    <>
      <PageHero title="A managed operation in 90 days" lede="You set the standards. We staff, train, launch, and report, following the same plan every time." />
      <Breadcrumbs path="/how-it-works" />
      <Timeline />
      <Model />
      <CtaBand />
    </>
  );
}
