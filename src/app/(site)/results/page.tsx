import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { CtaBand, PageHero } from "@/components/site/bits";
import { Results } from "@/components/site/sections";

export const metadata: Metadata = pageMetadata("/results");

export default function Page() {
  return (
    <>
      <PageHero title="Results you can check" lede="Every figure here comes from our public Upwork profile: 100% Job Success across 27 jobs." />
      <Breadcrumbs path="/results" />
      <Results />
      <CtaBand />
    </>
  );
}
