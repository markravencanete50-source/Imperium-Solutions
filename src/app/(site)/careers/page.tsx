import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/site/bits";
import { site } from "@/lib/content";

export const metadata: Metadata = pageMetadata("/careers");

export default function Page() {
  return (
    <>
      <PageHero
        title="Work with Imperium"
        lede="We hire customer support, virtual assistance, and operations people who work from home on client hours."
      />
      <Breadcrumbs path="/careers" />
      <section className="band">
        <div className="wrap prose">
          <h2 style={{ marginTop: 0 }}>How to apply</h2>
          <p>
            Email your resume to <a href={`mailto:${site.careersEmail}`}>{site.careersEmail}</a> with the role you are
            interested in as the subject.
          </p>
          <p>Include these details so we can match you faster:</p>
          <ul>
            <li>The kind of work you have done: chat, email, voice, admin, or project support</li>
            <li>The hours and time zones you can cover</li>
            <li>Your home setup: computer, internet speed, and backup power or connection</li>
          </ul>
          <p>Please do not use the client contact form for applications. It goes to a different team.</p>
        </div>
      </section>
    </>
  );
}
