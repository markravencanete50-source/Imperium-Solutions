import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { IconLine, PageHero, RelatedLinks, SectionHead, delay } from "@/components/site/bits";
import { Icon } from "@/components/site/icons";
import { site } from "@/lib/content";

export const metadata: Metadata = pageMetadata("/careers");

export default function Page() {
  const apply = `mailto:${site.careersEmail}?subject=${encodeURIComponent("Application")}`;
  return (
    <>
      <PageHero
        title="Work with Imperium"
        lede="We hire customer support, virtual assistance, and operations people who work from home on client hours."
        image="var(--img-back)"
        imageAlt="Hands typing on a laptop at a desk by a window"
        actions="none"
      />
      <Breadcrumbs path="/careers" />
      <section className="band band--raise" aria-labelledby="apply-title">
        <div className="wrap">
          <SectionHead
            id="apply-title"
            title="How to apply"
            lede="Three steps. Matching you to a client is faster when we have the details up front."
          />
          <ol className="plain apply">
            <li className="tile" data-reveal="">
              <Icon name="mail" size={28} />
              <h3>Email your resume</h3>
              <p>
                Send it to <a href={`mailto:${site.careersEmail}`}>{site.careersEmail}</a> with the role you want as the
                subject.
              </p>
            </li>
            <li className="tile" data-reveal="" style={delay(100)}>
              <Icon name="clipboard" size={28} />
              <h3>Add three details</h3>
              <ul className="plain il-list">
                <IconLine icon="headset">The work you have done: chat, email, voice, admin, or project support</IconLine>
                <IconLine icon="clock">The hours and time zones you can cover</IconLine>
                <IconLine icon="laptop">Your home setup: computer, internet speed, and backup power or connection</IconLine>
              </ul>
            </li>
            <li className="tile" data-reveal="" style={delay(200)}>
              <Icon name="shield" size={28} />
              <h3>Skip the client form</h3>
              <p>Please do not use the client contact form for applications. It goes to a different team.</p>
            </li>
          </ol>
          <div className="actions" data-reveal="">
            <a className="btn btn--amber" href={apply}>
              Email your resume
            </a>
          </div>
        </div>
      </section>
      <RelatedLinks
        items={[
          { href: "/about", title: "About Imperium", text: "Who we are and how the team works." },
          { href: "/how-it-works", title: "How it works", text: "How we run client engagements." },
        ]}
      />
    </>
  );
}
