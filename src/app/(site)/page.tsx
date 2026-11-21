import Hero from "@/components/site/Hero";
import Timeline from "@/components/site/Timeline";
import Coverage from "@/components/site/Coverage";
import Industries from "@/components/site/Industries";
import Contact from "@/components/site/Contact";
import { About, Model, Results, Services, StatStrip } from "@/components/site/sections";


export default function HomePage() {
  return (
    <>
      <Hero>
        <StatStrip />
      </Hero>
      <Services />
      <Model />
      <Timeline />
      <Results compact />
      <Industries compact />
      <Coverage />
      <About compact />
      <Contact />
    </>
  );
}
