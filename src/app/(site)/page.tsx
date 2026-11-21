import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Faq from "@/components/seo/Faq";
import { pageMetadata } from "@/lib/seo/metadata";
import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import Timeline from "@/components/site/Timeline";
import Coverage from "@/components/site/Coverage";
import Industries from "@/components/site/Industries";
import Statement from "@/components/site/Statement";
import Contact from "@/components/site/Contact";
import { About, Model, Results, Services } from "@/components/site/sections";

export const metadata: Metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <>
      <Breadcrumbs path="/" />
      <Hero />
      <Marquee />
      <Model />
      <Services />
      <Timeline />
      <Coverage />
      <Results />
      <Industries />
      <About />
      <Statement />
      <Faq />
      <Contact />
    </>
  );
}
