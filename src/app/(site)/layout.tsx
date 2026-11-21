import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SiteMotion from "@/components/site/SiteMotion";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <SiteMotion />
    </>
  );
}
