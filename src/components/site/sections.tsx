import { site } from "@/lib/content";
import { Photo, RevealList, Rise, SectionHead } from "./bits";
import { CountUp } from "./motion";

// Static page sections. Each one is a full width band and can be placed on any page.

export function Model() {
  return (
    <section className="band" id="model" aria-labelledby="model-title">
      <div className="wrap">
        <SectionHead
          id="model-title"
          title="You set the standards. Imperium runs the team."
          lede="Hiring is only the beginning. Someone still has to recruit, train, schedule, supervise, and manage the people. That part is ours."
        />
        <div className="flow" data-reveal="" aria-hidden="true">
          <div className="node node--you">
            <b>You</b>
            <span>Set the standards</span>
          </div>
          <div className="lane">
            <span className="lane-cap lane-cap--top">Requirements and service standards</span>
            <i className="lane-line" />
            <i className="lane-line lane-line--back" />
            <span className="lane-cap lane-cap--bot">Weekly reports and KPI reviews</span>
          </div>
          <div className="node node--imp">
            <b>Imperium</b>
            <span>Runs the operation</span>
          </div>
          <div className="lane">
            <span className="lane-cap lane-cap--top">Training, schedules, and coaching</span>
            <i className="lane-line" />
            <i className="lane-line lane-line--back" />
            <span className="lane-cap lane-cap--bot">Daily performance and quality checks</span>
          </div>
          <div className="node node--team">
            <b>Your team</b>
            <span>Does the work</span>
          </div>
        </div>
        <div className="handover" data-reveal="">
          <div className="handover-you">
            <h3>You define</h3>
            <ul className="plain">
              <li>The responsibilities</li>
              <li>The coverage hours</li>
              <li>The service standards</li>
              <li>One point of contact</li>
            </ul>
          </div>
          <div className="handover-us">
            <h3>Imperium manages</h3>
            <div className="groups">
              <div>
                <h4>Setup</h4>
                <ul className="plain">
                  <li>Recruitment coordination</li>
                  <li>Onboarding and training</li>
                  <li>Workflows and KPIs</li>
                  <li>Launch preparation</li>
                </ul>
              </div>
              <div>
                <h4>Daily operations</h4>
                <ul className="plain">
                  <li>Scheduling and supervision</li>
                  <li>Quality assurance</li>
                  <li>Coaching and escalations</li>
                  <li>Staffing coordination</li>
                </ul>
              </div>
              <div>
                <h4>Reporting</h4>
                <ul className="plain">
                  <li>Weekly performance updates</li>
                  <li>KPI tracking</li>
                  <li>Monthly operational reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section className="band band--mist" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <SectionHead
          id="services-title"
          title="One managed team for both sides of your business"
          lede="Start with the side that hurts most. Add the other when you are ready."
        />
        <div className="split">
          <article className="svc">
            <Photo image="var(--img-front)" alt="A support headset with a microphone beside a laptop in a home office" />
            <h3 data-reveal="">Front office</h3>
            <p className="tag" data-reveal="">
              Customer support that answers when your customers ask.
            </p>
            <h4 data-reveal="">Customer support</h4>
            <RevealList
              className="rows"
              items={[
                "Live chat, email, and voice support",
                "Customer inquiries, onboarding, and account assistance",
                "Ticket management, follow ups, and escalations",
                "Business hours, extended hours, or round the clock coverage",
              ]}
            />
          </article>
          <article className="svc">
            <Photo image="var(--img-back)" alt="Hands typing on a laptop at a desk by a window" delayMs={150} />
            <h3 data-reveal="">Back office</h3>
            <p className="tag" data-reveal="">
              The recurring work that keeps the business moving.
            </p>
            <h4 data-reveal="">Virtual assistance and administration</h4>
            <RevealList
              className="rows"
              items={[
                "CRM management and data organization",
                "Inbox, calendar, and appointment coordination",
                "Sales administration and lead follow ups",
                "Executive assistance and administrative tasks",
              ]}
            />
            <h4 data-reveal="">Project management and operations</h4>
            <RevealList
              className="rows"
              items={[
                "Project tracking and team coordination",
                "Digital operations and workflow management",
                "Process documentation and reporting",
              ]}
            />
          </article>
        </div>
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
    text: "Multi agent live chat coverage, transaction inquiries, verification support, escalations, and shift coordination.",
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

export function Results() {
  return (
    <section className="band" id="results" aria-labelledby="results-title">
      <div className="wrap">
        <SectionHead
          id="results-title"
          title="Work on record"
          lede="These engagements are documented on our Upwork profile, where each client rates the work."
        />
        <div className="res-top">
          {results.map((r, i) => (
            <article className="res" key={r.title} data-reveal="" style={{ ["--d" as string]: `${i * 140}ms` }}>
              <div className="res-n">
                <CountUp value={r.value} suffix={r.suffix} />
              </div>
              <div className="res-u">{r.unit}</div>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
              {r.rating ? <p className="res-r">{r.rating}</p> : null}
            </article>
          ))}
        </div>
        <ul className="plain res-more">
          <li data-reveal="">
            <b>UK real estate brokerage</b>
            <span>Administrative and sales support.</span>
            <em>Featured client on our Upwork profile</em>
          </li>
          <li data-reveal="" style={{ ["--d" as string]: "75ms" }}>
            <b>AI software company</b>
            <span>Customer success.</span>
            <em>5 star rating</em>
          </li>
        </ul>
        <p className="after-table" data-reveal="">
          Client reviews on this site are quoted word for word from Upwork.{" "}
          <a className="textlink" href={site.upworkUrl} target="_blank" rel="noopener">
            Read them on our Upwork profile
          </a>
        </p>
      </div>
    </section>
  );
}

export function About() {
  const facts = [
    ["Team size", "11 to 50 people"],
    ["On Upwork since", "August 2020"],
    ["Upwork status", "Top Rated, 100% Job Success"],
    ["Clients", "Small, medium, and large businesses"],
    ["Leadership", "Enterprise customer support management experience"],
  ];
  return (
    <section className="band" id="about" aria-labelledby="about-title">
      <div className="wrap about">
        <figure>
          <Photo image="var(--img-about)" alt="A home office desk with a monitor in front of a bay window" />
          {/* TODO: replace with real Imperium team photos and remove this note. */}
          <figcaption>A home office, photographed by Michael Proctor.</figcaption>
        </figure>
        <div className="about-text">
          <Rise id="about-title">A managed team that works from home</Rise>
          <p data-reveal="">
            {site.legalName} provides managed customer support, virtual assistance, and back office operations for US
            and international businesses.
          </p>
          <p data-reveal="">
            Our people work from home on your hours. We handle the scheduling, supervision, and quality assurance, so
            you get a working operation, not more people to manage.
          </p>
          <dl className="facts">
            {facts.map(([k, v], i) => (
              <div key={k} data-reveal="" style={{ ["--d" as string]: `${i * 75}ms` }}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
