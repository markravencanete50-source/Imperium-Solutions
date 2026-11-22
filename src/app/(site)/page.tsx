import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Faq from "@/components/seo/Faq";
import { pageMetadata } from "@/lib/seo/metadata";
import Hero from "@/components/site/Hero";
import Timeline from "@/components/site/Timeline";
import Industries from "@/components/site/Industries";
import Contact from "@/components/site/Contact";
import { Model, Results, Services, StatStrip } from "@/components/site/sections";


export const metadata: Metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <>
      <Breadcrumbs path="/" />
      <Hero>
        <StatStrip />
      </Hero>
      <Services />
      <Model />
      <Timeline />
      <Results compact />
      <Industries compact />
      <Faq />
      <Contact />
    </>
  );
}
