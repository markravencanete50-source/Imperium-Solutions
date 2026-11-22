import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/site/bits";
import { photoCredits } from "@/lib/content";

export const metadata: Metadata = pageMetadata("/credits");

export default function Page() {
  return (
    <>
      <PageHero title="Photo credits" lede="The photographers whose work appears on this website." actions="none" />
      <Breadcrumbs path="/credits" />
      <section className="band legal-page" aria-label="Photo credits">
        <div className="wrap">
          <ul className="plain credit-list">
            {photoCredits.map((c) => (
              <li key={c.label}>
                <a className="textlink" href={c.href} target="_blank" rel="noopener">
                  {c.label}
                </a>
                <span>{c.by}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
