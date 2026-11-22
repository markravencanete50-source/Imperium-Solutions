import Link from "next/link";
import { site, stats } from "@/lib/content";
import { IconLine, Photo, Rise, SectionHead, delay } from "./bits";
import DetailCard from "./DetailCard";
import { Graphic, type GraphicName } from "./graphics";
import { Icon, type IconName } from "./icons";
import { CountUp } from "./motion";

// Static page sections. Each one is a full width band and can be placed on any page.

/** The public Upwork record as five tiles. */
export function StatStrip({ note = true }: { note?: boolean }) {
  return (
    <div className="statstrip">
      <div className="stat-grid" role="list" aria-label="Upwork track record">
        {stats.map((s, i) => (
          <div className="stat" role="listitem" key={s.label} data-reveal="" style={delay(i * 70)}>
            {"text" in s ? (
              <span className="stat-n">{s.text}</span>
            ) : (
              <CountUp
                className="stat-n"
                value={s.value}
                suffix={"suffix" in s ? s.suffix : ""}
                plain={"plain" in s ? s.plain : false}
                delayMs={200}
              />
            )}
            <span className="stat-l">{s.label}</span>
          </div>
        ))}
      </div>
      {note ? (
        <p className="stat-foot">
          Every figure is public.{" "}
          <a className="textlink" href={site.upworkUrl} target="_blank" rel="noopener">
            Check them on our Upwork profile
          </a>
        </p>
      ) : null}
    </div>
  );
}

const youDefine: { icon: IconName; text: string }[] = [
  { icon: "clipboard", text: "The responsibilities" },
  { icon: "clock", text: "The coverage hours" },
  { icon: "target", text: "The service standards" },
  { icon: "user", text: "One point of contact" },
];

const weManage: { title: string; icon: IconName; line: string; items: string[] }[] = [
  {
    title: "Setup",
    icon: "flag",
    line: "We recruit, train, and prepare the team before launch.",
    items: ["Recruitment coordination", "Onboarding and training", "Workflows and KPIs", "Launch preparation"],
  },
  {
    title: "Daily operations",
    icon: "users",
    line: "We schedule, supervise, and coach the team every day.",
    items: ["Scheduling and supervision", "Quality assurance", "Coaching and escalations", "Staffing coordination"],
  },
  {
    title: "Reporting",
    icon: "chart",
    line: "You get weekly updates and a monthly review.",
    items: ["Weekly performance updates", "KPI tracking", "Monthly operational reviews"],
  },
];

/** You define the work, Imperium runs it. A pulse travels from your side into the three stages we manage. */
export function Model() {
  return (
    <section className="band" id="model" aria-labelledby="model-title">
      <div className="wrap">
        <SectionHead
          id="model-title"
          title="You set the standards. Imperium runs the team."
          lede="Hiring is only the start. We recruit, train, schedule, and supervise, so you manage results, not people."
        />
        <div className="model">
          <div className="model-you tile" data-reveal="">
            <h3>You define</h3>
            <ul className="plain model-chips">
              {youDefine.map((y) => (
                <li key={y.text}>
                  <Icon name={y.icon} size={20} />
                  {y.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="model-arrow" aria-hidden="true" data-reveal="">
            <span className="model-pulse" />
            <Icon name="arrow" size={28} />
          </div>
          <div className="model-us" data-reveal="" style={delay(120)}>
            <h3>Imperium manages</h3>
            <div className="model-groups">
              {weManage.map((g, i) => (
                <DetailCard
                  key={g.title}
                  reveal={false}
                  className="stage tile--hi"
                  eyebrow={`Imperium manages, step ${i + 1} of 3`}
                  title={g.title}
                  more="See the tasks"
                  tile={
                    <>
                      <span className="stage-n">{i + 1}</span>
                      <Icon name={g.icon} size={28} />
                      <h4>{g.title}</h4>
                      <p>{g.line}</p>
                    </>
                  }
                >
                  <p className="modal-lede">{g.line}</p>
                  <ul className="plain ticks">
                    {g.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <div className="actions">
                    <Link className="btn btn--amber" href="/contact">
                      Book a 15 minute consultation
                    </Link>
                    <Link className="btn btn--ghost" href="/how-it-works">
                      See the 90 day plan
                    </Link>
                  </div>
                </DetailCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Capability = {
  key: string;
  graphic: GraphicName;
  title: string;
  line: string;
  items: { icon: IconName; text: string }[];
  link?: { href: string; label: string };
};

const sides: { title: string; tag: string; caps: Capability[] }[] = [
  {
    title: "Front office",
    tag: "Customer support that answers when your customers ask.",
    caps: [
      {
        key: "chat",
        graphic: "chat",
        title: "Live chat, email, and voice",
        line: "Your customers get a clear answer on the channel they chose.",
        items: [
          { icon: "chat", text: "Live chat, email, and voice support" },
          { icon: "users", text: "Inquiries, onboarding, and account help" },
        ],
      },
      {
        key: "tickets",
        graphic: "tickets",
        title: "Tickets and escalations",
        line: "Every request is logged, followed up, and closed or escalated.",
        items: [{ icon: "ticket", text: "Ticket management, follow ups, and escalations" }],
      },
      {
        key: "coverage",
        graphic: "coverage",
        title: "Coverage on your hours",
        line: "Business hours, extended hours, or round the clock, in your time zone.",
        items: [
          { icon: "clock", text: "Business hours" },
          { icon: "calendar", text: "Extended hours" },
          { icon: "globe", text: "Round the clock" },
        ],
        link: { href: "/services#coverage", label: "See how coverage hours work" },
      },
    ],
  },
  {
    title: "Back office",
    tag: "The recurring work that keeps the business moving.",
    caps: [
      {
        key: "crm",
        graphic: "crm",
        title: "CRM and sales admin",
        line: "Clean records, and leads that get followed up on time.",
        items: [
          { icon: "database", text: "CRM management and data organization" },
          { icon: "trend", text: "Sales administration and lead follow ups" },
        ],
      },
      {
        key: "inbox",
        graphic: "inbox",
        title: "Inbox, calendar, and admin",
        line: "Inboxes under control, meetings booked, and admin tasks done.",
        items: [
          { icon: "calendar", text: "Inbox, calendar, and appointments" },
          { icon: "briefcase", text: "Executive assistance and admin tasks" },
        ],
      },
      {
        key: "flow",
        graphic: "flow",
        title: "Projects and operations",
        line: "Projects tracked, workflows documented, and reports on time.",
        items: [
          { icon: "clipboard", text: "Project tracking and team coordination" },
          { icon: "workflow", text: "Digital operations and workflow management" },
          { icon: "file", text: "Process documentation and reporting" },
        ],
      },
    ],
  },
];

const included = ["Recruitment and training", "Scheduling and supervision", "Quality assurance", "Weekly performance updates"];

/** The two service lines as a deck of tiles. Each tile animates what the work looks like and opens a card with the detail. */
export function Services() {
  return (
    <section className="band band--raise" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <SectionHead
          id="services-title"
          title="What we take off your plate"
          lede="Start with the side that hurts most. Add the other when you are ready. Open any tile to see what is included."
        />
        {sides.map((side) => (
          <div className="deck" key={side.title}>
            <div className="deck-head" data-reveal="">
              <h3>{side.title}</h3>
              <p>{side.tag}</p>
            </div>
            <div className="deck-grid">
              {side.caps.map((c, i) => (
                <DetailCard
                  key={c.key}
                  className="cap"
                  style={delay(i * 90)}
                  eyebrow={side.title}
                  title={c.title}
                  tile={
                    <>
                      <Graphic name={c.graphic} />
                      <h4 className="cap-title">{c.title}</h4>
                      <p className="cap-line">{c.line}</p>
                    </>
                  }
                >
                  <p className="modal-lede">{c.line}</p>
                  <ul className="plain il-list">
                    {c.items.map((it) => (
                      <IconLine key={it.text} icon={it.icon}>
                        {it.text}
                      </IconLine>
                    ))}
                  </ul>
                  <div className="modal-panel">
                    <h3>Every team comes with</h3>
                    <ul className="plain ticks ticks--two">
                      {included.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="actions">
                    <Link className="btn btn--amber" href="/contact">
                      Book a 15 minute consultation
                    </Link>
                    {c.link ? (
                      <Link className="btn btn--ghost" href={c.link.href}>
                        {c.link.label}
                      </Link>
                    ) : null}
                  </div>
                </DetailCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const results = [
  {
    value: 900,
    suffix: "+",
    unit: "documented hours",
    title: "Round the clock crypto support",
    text: "Multi agent live chat, transaction inquiries, verification, escalations, and shift coordination.",
    rating: "",
  },
  {
    value: 835,
    suffix: "",
    unit: "documented hours",
    title: "College education marketing",
    text: "Project management, digital operations, and support across several roles.",
    rating: "Two 5 star engagements",
  },
  {
    value: 466,
    suffix: "",
    unit: "hours",
    title: "Business operations",
    text: "An Operations Manager and CEO Assistant engagement.",
    rating: "5 star rating",
  },
];

export function Results({ compact = false }: { compact?: boolean }) {
  return (
    <section className="band" id="results" aria-labelledby="results-title">
      <div className="wrap">
        <SectionHead
          id="results-title"
          title="Work on record"
          lede="Documented on our Upwork profile, where each client rates the work."
        />
        <div className="res-top">
          {results.map((r, i) => {
            const face = (
              <>
                <div className="res-n">
                  <CountUp value={r.value} suffix={r.suffix} />
                </div>
                <div className="res-u">{r.unit}</div>
                <h3>{r.title}</h3>
                {compact ? null : <p>{r.text}</p>}
                {r.rating ? (
                  <p className="res-r">
                    <Icon name="star" size={18} />
                    {r.rating}
                  </p>
                ) : null}
              </>
            );
            if (!compact) {
              return (
                <article className="res tile" key={r.title} data-reveal="" style={delay(i * 120)}>
                  {face}
                </article>
              );
            }
            return (
              <DetailCard
                key={r.title}
                className="res"
                style={delay(i * 120)}
                eyebrow={`${r.value.toLocaleString("en-US")}${r.suffix} ${r.unit}`}
                title={r.title}
                more="Read the engagement"
                tile={face}
              >
                <p className="modal-lede">{r.text}</p>
                {r.rating ? (
                  <p className="res-r">
                    <Icon name="star" size={18} />
                    {r.rating}
                  </p>
                ) : null}
                <p className="modal-note">
                  Hours and ratings are recorded on our{" "}
                  <a className="textlink" href={site.upworkUrl} target="_blank" rel="noopener">
                    Upwork profile
                  </a>
                  .
                </p>
                <div className="actions">
                  <Link className="btn btn--amber" href="/contact">
                    Book a 15 minute consultation
                  </Link>
                  <Link className="btn btn--ghost" href="/results">
                    See all results
                  </Link>
                </div>
              </DetailCard>
            );
          })}
        </div>
        <ul className="plain res-more">
          <li className="tile" data-reveal="">
            <Icon name="building" size={26} />
            <div>
              <b>UK real estate brokerage</b>
              <span>Administrative and sales support. Featured client on our Upwork profile.</span>
            </div>
          </li>
          <li className="tile" data-reveal="" style={delay(90)}>
            <Icon name="laptop" size={26} />
            <div>
              <b>AI software company</b>
              <span>Customer success. 5 star rating.</span>
            </div>
          </li>
        </ul>
        <p className="after-table" data-reveal="">
          Read the{" "}
          <Link className="textlink" href="/testimonials">
            client reviews
          </Link>{" "}
          or check every figure on our{" "}
          <a className="textlink" href={site.upworkUrl} target="_blank" rel="noopener">
            Upwork profile
          </a>
          .
        </p>
      </div>
    </section>
  );
}

const facts: { icon: IconName; k: string; v: string }[] = [
  { icon: "users", k: "Team size", v: "11 to 50 people" },
  { icon: "calendar", k: "On Upwork since", v: "August 2020" },
  { icon: "star", k: "Upwork status", v: "Top Rated, 100% Job Success" },
  { icon: "building", k: "Clients", v: "Small, medium, and large businesses" },
  { icon: "briefcase", k: "Leadership", v: "Enterprise customer support management experience" },
];

export function About({ compact = false }: { compact?: boolean }) {
  const shown = compact ? facts.slice(0, 4) : facts;
  return (
    <section className="band band--raise" id="about" aria-labelledby="about-title">
      <div className="wrap about">
        <figure>
          <Photo image="var(--img-about)" alt="A home office desk with a monitor in front of a bay window" />
          {/* TODO: replace with real Imperium team photos and remove this note. */}
          <figcaption>A home office, photographed by Michael Proctor.</figcaption>
        </figure>
        <div className="about-text">
          <Rise id="about-title">A managed team that works from home</Rise>
          <p data-reveal="">
            Our people work on your hours. We handle scheduling, supervision, and quality assurance, so you get a working
            operation, not more people to manage.
          </p>
          <ul className="plain facts">
            {shown.map((f, i) => (
              <li className="tile" key={f.k} data-reveal="" style={delay(i * 70)}>
                <Icon name={f.icon} size={22} />
                <span className="fact-k">{f.k}</span>
                <span className="fact-v">{f.v}</span>
              </li>
            ))}
          </ul>
          {compact ? (
            <Link className="textlink more" href="/about" data-reveal="">
              More about Imperium
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const needs: { icon: IconName; text: string }[] = [
  { icon: "user", text: "A point of contact" },
  { icon: "clipboard", text: "Your requirements" },
  { icon: "clock", text: "Coverage hours" },
  { icon: "lock", text: "System access" },
  { icon: "book", text: "Available product documentation" },
  { icon: "shield", text: "Approval of service standards" },
];

export function Needs({ tone = "ink" }: { tone?: "ink" | "raise" }) {
  return (
    <section className={`band${tone === "raise" ? " band--raise" : ""}`} id="needs" aria-labelledby="needs-title">
      <div className="wrap">
        <SectionHead
          id="needs-title"
          title="What we need from you"
          lede="No documented processes yet? We can help organize them."
        />
        <ul className="plain needs-grid">
          {needs.map((n, i) => (
            <li className="tile need" key={n.text} data-reveal="" style={delay(i * 70)}>
              <Icon name={n.icon} size={26} />
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
