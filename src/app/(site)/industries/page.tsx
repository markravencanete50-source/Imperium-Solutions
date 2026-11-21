import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { CtaBand, PageHero, RelatedLinks } from "@/components/site/bits";
import Industries from "@/components/site/Industries";

export const metadata: Metadata = pageMetadata("/industries");

export default function Page() {
  return (
    <>
      <PageHero
        title="Support teams for every industry"
        lede="Real estate, healthcare, property management, ecommerce, and more. The managed model stays the same whatever you sell."
        image="var(--img-h-realestate)"
        imageAlt="A large house at dusk with lights on the porch"
      />
      <Breadcrumbs path="/industries" />
      <Industries />
      <RelatedLinks
        items={[
          { href: "/results", title: "Results", text: "Hours and ratings from engagements on record." },
          { href: "/services", title: "Services", text: "Front office and back office work we run." },
        ]}
      />
      <CtaBand />
    </>
  );
}
