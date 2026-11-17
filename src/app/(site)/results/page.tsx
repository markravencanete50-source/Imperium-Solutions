import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/site/bits";
import { Results } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "Results",
  description: "Documented Imperium engagements and hours from our Upwork track record.",
  alternates: { canonical: "/results" },
};

export default function Page() {
  return (
    <>
      <PageHero title="Results you can check" lede="Every figure here comes from our public Upwork profile: 100% Job Success across 27 jobs." />
      <Results />
      <CtaBand />
    </>
  );
}
