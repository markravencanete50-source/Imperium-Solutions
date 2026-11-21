import type { Metadata } from "next";
import { PageHero } from "@/components/site/bits";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Imperium Solutions collects, uses, and protects the details you send through this website.",
  alternates: { canonical: "/privacy" },
};

// TODO: this is a starting template, not legal advice. Have it reviewed before launch,
// and fill in the company address and the date it takes effect.
const toc: [string, string][] = [
  ["who", "Who we are"],
  ["collect", "What we collect"],
  ["use", "How we use it"],
  ["stored", "Where it is stored"],
  ["keep", "How long we keep it"],
  ["choices", "Your choices"],
  ["changes", "Changes"],
];

export default function Page() {
  return (
    <>
      <PageHero title="Privacy Policy" lede="What we collect through this website, why, and the choices you have." actions="none" />
      <section className="band legal-page">
        <div className="wrap legal-grid">
          <nav className="toc" aria-label="On this page">
            <p>On this page</p>
            <ol className="plain">
              {toc.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="prose">
          <h2 id="who">Who we are</h2>
          <p>
            This website is run by {site.legalName} You can reach us about privacy at{" "}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
          </p>
          <h2 id="collect">What we collect</h2>
          <ul>
            <li>Details you type into our forms: your name, work email, company, and what you need help with</li>
            <li>Consultation bookings: the time you chose and your time zone</li>
            <li>Basic technical data your browser sends, such as IP address, used to protect the forms from abuse</li>
          </ul>
          <h2 id="use">How we use it</h2>
          <ul>
            <li>To reply to your request, prepare an estimate, and hold your consultation</li>
            <li>To keep a record of our conversations with prospective and current clients</li>
            <li>To keep the website secure</li>
          </ul>
          <p>We do not sell your details and we do not use them for advertising.</p>
          <h2 id="stored">Where it is stored</h2>
          <p>
            Form submissions are stored in Google Firebase and the website is hosted on Vercel. Both act as service
            providers on our behalf. Notifications about new requests may pass through our automation provider.
          </p>
          <h2 id="keep">How long we keep it</h2>
          <p>
            We keep enquiry details for as long as we are in conversation with you and for a reasonable period after,
            unless you ask us to delete them sooner.
          </p>
          <h2 id="choices">Your choices</h2>
          <p>
            You can ask to see, correct, or delete the details we hold about you by emailing{" "}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>. If you are in the UK or the EU you also
            have the right to complain to your data protection authority.
          </p>
          <h2 id="changes">Changes</h2>
          <p>We will post any changes to this policy on this page.</p>
          </div>
        </div>
      </section>
    </>
  );
}
