import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { CtaBand, PageHero } from "@/components/site/bits";
import Coverage from "@/components/site/Coverage";
import { Model, Services } from "@/components/site/sections";

export const metadata: Metadata = pageMetadata("/services");

export default function Page() {
  return (
    <>
      <PageHero title="Front office and back office, managed for you" lede="Customer support, virtual assistance, and operations work, run by a team that Imperium recruits, trains, and supervises." />
      <Breadcrumbs path="/services" />
      <Services />
      <Model />
      <Coverage />
      <CtaBand />
    </>
  );
}
