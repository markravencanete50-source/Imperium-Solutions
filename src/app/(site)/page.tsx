import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import Timeline from "@/components/site/Timeline";
import Coverage from "@/components/site/Coverage";
import Industries from "@/components/site/Industries";
import Statement from "@/components/site/Statement";
import Contact from "@/components/site/Contact";
import { About, Model, Results, Services } from "@/components/site/sections";

export default function HomePage() {
  return (
    <>
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
      <Contact />
    </>
  );
}
