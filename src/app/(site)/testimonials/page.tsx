import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { CtaBand, PageHero, RelatedLinks, SectionHead, delay } from "@/components/site/bits";
import { Icon } from "@/components/site/icons";
import { StatStrip } from "@/components/site/sections";
import { site, testimonials } from "@/lib/content";

export const metadata: Metadata = pageMetadata("/testimonials");

export default function Page() {
  return (
    <>
      <PageHero
        title="What clients say"
        lede="Reviews from completed Upwork contracts, quoted word for word."
        image="var(--img-model)"
        imageAlt="Headphones and a laptop on a desk"
      />
      <Breadcrumbs path="/testimonials" />
      <section className="band" aria-labelledby="reviews-title">
        <div className="wrap">
          <SectionHead
            id="reviews-title"
            title="Client reviews"
            lede="Written reviews from our team's completed Upwork contracts. Client names stay private on Upwork."
          />
          <ul className="plain quotes">
            {testimonials.map((t, i) => (
              <li key={t.quote} data-reveal="" style={delay(i * 110)}>
                <figure className="quote tile">
                  <p className="quote-stars" aria-label={`Rated ${t.rating} out of 5`}>
                    <Icon name="star" size={18} />
                    <span>{t.rating}</span>
                  </p>
                  <blockquote>
                    <p>{t.quote}</p>
                  </blockquote>
                  <figcaption>
                    <b>Upwork client</b>
                    <span>
                      {t.role}, {t.period}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="after-table" data-reveal="">
            Every review and rating is public on our{" "}
            <a className="textlink" href={site.upworkUrl} target="_blank" rel="noopener">
              Upwork agency profile
            </a>
            .
          </p>
        </div>
      </section>
      <section className="band band--raise statband" aria-label="Upwork track record">
        <div className="wrap">
          <StatStrip />
        </div>
      </section>
      <RelatedLinks
        items={[
          { href: "/results", title: "Results", text: "The engagements behind the reviews." },
          { href: "/services", title: "Services", text: "What the team can take off your plate." },
        ]}
      />
      <CtaBand />
    </>
  );
}
