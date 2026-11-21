import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { PageHero } from "@/components/site/bits";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <PageHero title="Page not found" lede="That page does not exist or has moved. These pages will get you back on track." />
        <section className="band">
          <div className="wrap">
            <ul className="plain related-list">
              <li>
                <Link href="/">Home</Link>
                <span>Managed support and back office teams</span>
              </li>
              <li>
                <Link href="/services">Services</Link>
                <span>Customer support, virtual assistance, and operations</span>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
                <span>Book a 15 minute consultation or request an estimate</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
