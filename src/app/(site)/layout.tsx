import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SiteMotion from "@/components/site/SiteMotion";
import { site } from "@/lib/content";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.legalName,
  url: site.url,
  description: site.description,
  sameAs: [site.upworkUrl],
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <SiteMotion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    </>
  );
}
