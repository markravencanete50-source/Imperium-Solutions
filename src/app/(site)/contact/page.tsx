import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/site/bits";
import Contact from "@/components/site/Contact";

export const metadata: Metadata = pageMetadata("/contact");

export default function Page() {
  return (
    <>
      <PageHero
        title="Talk to Imperium"
        lede="Book a 15 minute consultation or tell us what you need, and we will come back with an estimate."
        actions="none"
      />
      <Breadcrumbs path="/contact" />
      <Contact />
    </>
  );
}
