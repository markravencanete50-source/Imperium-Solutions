import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/site/bits";
import Coverage from "@/components/site/Coverage";
import { Model, Services } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "Services",
  description: "Managed front office and back office teams: customer support, virtual assistance, administration, and project operations.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return (
    <>
      <PageHero title="Front office and back office, managed for you" lede="Customer support, virtual assistance, and operations work, run by a team that Imperium recruits, trains, and supervises." />
      <Services />
      <Model />
      <Coverage />
      <CtaBand />
    </>
  );
}
