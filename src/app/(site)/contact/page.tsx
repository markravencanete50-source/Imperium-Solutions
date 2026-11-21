import type { Metadata } from "next";
import { PageHero } from "@/components/site/bits";
import Contact from "@/components/site/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a 15 minute consultation with Imperium Solutions or request an estimate for your support team.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <>
      <PageHero
        title="Talk to Imperium"
        lede="Book a 15 minute consultation or tell us what you need, and we will come back with an estimate."
        actions="none"
      />
      <Contact />
    </>
  );
}
