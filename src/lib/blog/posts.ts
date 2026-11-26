// Blog posts. Each post is structured content, rendered by src/app/(site)/blog/[slug]/page.tsx.
// To publish a post: add an entry to `posts` (newest first) and bump CONTENT_LAST_MODIFIED in src/lib/seo/pages.ts.
// Copy rules from the client apply: no em dashes, no decorative symbols, no emojis. Real photos only.
// The description is the meta description: answer first, 140 to 160 characters.

/** Inline text: plain, bold, or an internal or external link. */
export type Inline = string | { b: string } | { text: string; href: string };

export type Block =
  | { type: "p"; text: Inline[] }
  | { type: "h2"; id: string; text: string }
  | { type: "ul"; items: Inline[][] }
  /** A list where each item starts with a bold lead, for example "Coverage:" or "Days 1 to 30: Launch." */
  | { type: "defs"; ordered?: boolean; items: { lead: string; text: string }[] }
  | { type: "cta"; title: string; text: string };

export type Post = {
  slug: string;
  title: string;
  /** Meta description, 140 to 160 characters. */
  description: string;
  /** Short summary shown on the blog index and under the title. */
  excerpt: string;
  /** ISO dates, fixed strings (cacheComponents forbids reading the clock while prerendering). */
  published: string;
  updated: string;
  section: string;
  keywords: string[];
  /** A real photograph from /public/images, credited on /credits. */
  image: { src: string; alt: string; width: number; height: number };
  body: Block[];
  faq: { q: string; a: string }[];
  /** Internal pages to suggest at the end of the post. */
  related: { href: string; title: string; text: string }[];
};

export const posts: Post[] = [
  {
    slug: "signs-saas-company-needs-outsourced-customer-support",
    title: "7 Signs Your SaaS Company Needs Outsourced Customer Support",
    description:
      "Ticket backlogs, after hours inquiries, and founders answering routine tickets are signs a SaaS company needs outsourced customer support. Here are all seven.",
    excerpt:
      "Growth brings more customers and more support work. Here is how to tell when an outsourced support team makes sense, and how to start without handing over everything.",
    published: "2026-11-26",
    updated: "2026-11-26",
    section: "Customer support",
    keywords: [
      "SaaS customer support outsourcing",
      "outsourced customer support",
      "managed customer support",
      "SaaS onboarding support",
      "after hours customer support",
    ],
    image: {
      src: "/images/front.webp",
      alt: "A support headset with a microphone beside a laptop in a home office",
      width: 1100,
      height: 700,
    },
    body: [
      {
        type: "p",
        text: [
          "Growing a SaaS business should mean more customers, stronger recurring revenue, and new opportunities. But growth also comes with a less exciting responsibility: supporting all those customers.",
        ],
      },
      {
        type: "p",
        text: [
          "What starts as a manageable inbox can quickly become a full-time operational challenge. Founders spend time answering tickets, customer success managers chase onboarding requirements, and product teams get interrupted by repetitive customer questions.",
        ],
      },
      {
        type: "p",
        text: [
          "Hiring more employees may seem like the obvious solution. However, building an internal support department requires more than recruitment. It requires training, scheduling, supervision, quality assurance, and ongoing performance management.",
        ],
      },
      { type: "p", text: ["For many growing SaaS companies, outsourced customer support offers an alternative."] },
      { type: "p", text: ["The question is knowing when it makes sense."] },

      { type: "h2", id: "what-is-saas-customer-support-outsourcing", text: "What is SaaS customer support outsourcing?" },
      {
        type: "p",
        text: ["SaaS customer support outsourcing is the practice of delegating selected customer service responsibilities to an external team."],
      },
      { type: "p", text: ["Depending on the company's requirements, outsourced teams can manage:"] },
      {
        type: "ul",
        items: [
          ["Email and live chat support"],
          ["Customer inquiries"],
          ["Basic product troubleshooting within documented procedures"],
          ["Customer onboarding assistance"],
          ["Ticket management"],
          ["Account-related follow-ups"],
          ["Escalation coordination"],
          ["Administrative and back-office tasks"],
        ],
      },
      {
        type: "p",
        text: [
          "A managed outsourcing partner can also take responsibility for recruitment, training, supervision, scheduling, quality assurance, and performance reporting.",
        ],
      },
      {
        type: "p",
        text: [
          "The objective is not necessarily to replace your existing team. It is to give your business additional operational capacity without having to manage every new employee internally.",
        ],
      },

      { type: "h2", id: "support-team-struggling-to-keep-up", text: "1. Your customer support team is struggling to keep up" },
      {
        type: "p",
        text: [
          "Increasing ticket volumes are a natural consequence of business growth. The problem begins when your team's capacity no longer matches customer demand.",
        ],
      },
      { type: "p", text: ["Common warning signs include:"] },
      {
        type: "ul",
        items: [
          ["Increasing ticket backlogs"],
          ["Longer response times"],
          ["Unresolved customer inquiries"],
          ["Frequent escalations"],
          ["Employees working beyond their scheduled hours"],
          ["Inconsistent customer experiences"],
        ],
      },
      {
        type: "p",
        text: [
          "Before hiring additional employees, assess which tickets require internal expertise and which can be handled through documented processes.",
        ],
      },
      {
        type: "p",
        text: ["Routine inquiries, account assistance, follow-ups, and initial ticket triage may be suitable for an outsourced team."],
      },
      {
        type: "p",
        text: ["This allows your internal employees to focus on complex issues while additional support capacity handles recurring work."],
      },

      {
        type: "h2",
        id: "founders-answering-routine-tickets",
        text: "2. Your founders and product teams are answering routine support tickets",
      },
      {
        type: "p",
        text: [
          "In an early-stage SaaS company, founders often handle customer support themselves. This can be valuable because it provides direct insight into customer needs and product limitations.",
        ],
      },
      { type: "p", text: ["But as the business grows, the same arrangement can become inefficient."] },
      {
        type: "p",
        text: [
          "If founders, engineers, or senior managers regularly spend hours answering repetitive questions, processing routine requests, or tracking customer issues, they have less time for product development and strategic priorities.",
        ],
      },
      { type: "p", text: ["The solution is not to remove these employees from customer feedback entirely."] },
      {
        type: "p",
        text: [
          "Instead, establish a support structure where trained representatives handle routine inquiries, escalate complex issues appropriately, and report recurring customer concerns to the right internal stakeholders.",
        ],
      },
      { type: "p", text: ["Your leadership team remains informed without being responsible for every interaction."] },

      { type: "h2", id: "support-outside-business-hours", text: "3. Your customers need support outside normal business hours" },
      { type: "p", text: ["SaaS customers do not always operate in the same time zone as your internal team."] },
      {
        type: "p",
        text: ["As your customer base expands, you may begin receiving inquiries during evenings, weekends, or overnight hours."],
      },
      {
        type: "p",
        text: ["Building extended-hours coverage internally introduces additional scheduling, staffing, and management requirements."],
      },
      {
        type: "p",
        text: [
          "An outsourced support team can help cover these gaps through business-hours, extended-hours, or round-the-clock support arrangements. ",
          { text: "See how coverage hours work", href: "/services#coverage" },
          ".",
        ],
      },
      {
        type: "p",
        text: [
          "Not every SaaS business needs 24/7 coverage. Review your ticket arrival patterns, customer expectations, and service commitments before deciding which coverage model is appropriate.",
        ],
      },
      { type: "p", text: ["The objective is to provide reliable support when customers actually need it."] },

      {
        type: "h2",
        id: "customer-success-managers-overwhelmed",
        text: "4. Your customer success managers are overwhelmed with administrative tasks",
      },
      {
        type: "p",
        text: ["Customer success managers should have enough time to help customers achieve meaningful outcomes with your product."],
      },
      {
        type: "p",
        text: ["However, their schedules can become filled with repetitive administrative responsibilities, including:"],
      },
      {
        type: "ul",
        items: [
          ["Updating CRM records"],
          ["Scheduling onboarding calls"],
          ["Following up on missing requirements"],
          ["Sending routine reminders"],
          ["Preparing customer reports"],
          ["Tracking implementation progress"],
        ],
      },
      {
        type: "p",
        text: ["These activities are important, but they do not always require the involvement of a senior customer success professional."],
      },
      {
        type: "p",
        text: [
          "A managed ",
          { text: "back-office team", href: "/services" },
          " can help coordinate recurring workflows, allowing customer success managers to spend more time on adoption, retention, strategic relationships, and account development.",
        ],
      },
      { type: "p", text: ["For many SaaS businesses, this is a practical starting point for outsourcing."] },

      { type: "h2", id: "hiring-creating-management-work", text: "5. Hiring more employees is creating additional management work" },
      {
        type: "p",
        text: ["Recruiting another support representative may increase your team's capacity, but it also creates new responsibilities."],
      },
      { type: "p", text: ["Someone needs to recruit, train, supervise, coach, schedule, and evaluate that employee."] },
      { type: "p", text: ["As the team grows, these responsibilities can become a substantial operational workload."] },
      {
        type: "p",
        text: ["This is an important distinction between hiring an individual remote worker and working with a managed outsourcing partner."],
      },
      { type: "p", text: ["When you hire an individual, your company is generally responsible for managing that person's performance."] },
      {
        type: "p",
        text: ["With a managed team, supervisory responsibilities can be included in the service, depending on the agreed scope."],
      },
      {
        type: "p",
        text: ["You retain control over service standards and business objectives while delegating much of the day-to-day team management."],
      },

      { type: "h2", id: "onboarding-inconsistent", text: "6. Customer onboarding is becoming inconsistent" },
      { type: "p", text: ["The customer relationship does not end when a subscription is purchased."] },
      { type: "p", text: ["Customers need guidance, timely communication, and a clear understanding of what happens next."] },
      {
        type: "p",
        text: [
          "Delayed onboarding, missed follow-ups, and unclear responsibilities can create frustration before customers have fully experienced the value of your product.",
        ],
      },
      { type: "p", text: ["An outsourced onboarding support team can assist with:"] },
      {
        type: "ul",
        items: [
          ["Collecting customer requirements"],
          ["Coordinating onboarding schedules"],
          ["Tracking outstanding tasks"],
          ["Sending reminders and follow-ups"],
          ["Maintaining onboarding documentation"],
          ["Escalating implementation delays"],
        ],
      },
      {
        type: "p",
        text: [
          "Your internal specialists can remain responsible for technical configurations, strategic guidance, and complex implementation decisions.",
        ],
      },
      { type: "p", text: ["The outsourced team helps ensure that recurring administrative activities are completed consistently."] },

      {
        type: "h2",
        id: "grow-without-building-a-department",
        text: "7. You need to grow support capacity without building an entire department",
      },
      { type: "p", text: ["A growing SaaS business may not be ready to establish a full internal customer support department."] },
      {
        type: "p",
        text: ["You may need additional coverage or operational assistance, but not another layer of recruitment, management, and infrastructure."],
      },
      {
        type: "p",
        text: [
          "An outsourced support model allows you to define the specific responsibilities your business needs and evaluate the arrangement before expanding its scope.",
        ],
      },
      {
        type: "p",
        text: [
          "A sensible approach is to begin with clearly documented, measurable tasks rather than outsourcing your entire customer operation immediately.",
        ],
      },
      {
        type: "p",
        text: ["This could mean starting with an inbox, a specific support channel, onboarding coordination, or recurring back-office activities."],
      },
      { type: "p", text: ["Once those workflows are stable, you can assess whether additional responsibilities should be delegated."] },

      { type: "h2", id: "when-not-to-outsource", text: "When should a SaaS company not outsource customer support?" },
      { type: "p", text: ["Outsourcing is not automatically the right decision for every business."] },
      { type: "p", text: ["Keeping certain activities internal may be more appropriate when:"] },
      {
        type: "ul",
        items: [
          ["Customer interactions require advanced product expertise."],
          ["Support involves sensitive decisions that cannot be delegated."],
          ["Regulatory or security requirements cannot be met by the proposed provider."],
          ["Ticket volumes are too low to justify external staffing."],
          ["The business has not established clear responsibilities or escalation procedures."],
        ],
      },
      {
        type: "p",
        text: ["Even in these situations, outsourcing selected administrative or routine support activities may still be worth exploring."],
      },
      { type: "p", text: ["The key is identifying which responsibilities can be delegated safely and effectively."] },

      { type: "h2", id: "how-to-get-started", text: "How to get started with outsourced SaaS customer support" },
      { type: "p", text: ["Before selecting an outsourcing partner, define five things:"] },
      {
        type: "defs",
        ordered: true,
        items: [
          { lead: "Responsibilities:", text: "Which tasks should the external team handle?" },
          { lead: "Coverage:", text: "What hours and communication channels need support?" },
          { lead: "Service standards:", text: "What response times, quality expectations, and performance indicators matter?" },
          { lead: "Escalation procedures:", text: "Which issues must be referred to internal employees?" },
          {
            lead: "Management accountability:",
            text: "Who handles recruitment, supervision, quality assurance, and performance reporting?",
          },
        ],
      },
      {
        type: "p",
        text: [
          "A successful outsourcing arrangement requires more than assigning tickets to another team. It requires a clear operating structure.",
        ],
      },

      { type: "h2", id: "how-imperium-helps", text: "How Imperium Solutions helps growing SaaS companies" },
      {
        type: "p",
        text: [
          "At Imperium Solutions, we provide managed customer support and back-office operations designed around your business requirements.",
        ],
      },
      {
        type: "p",
        text: [
          "You define the responsibilities, coverage hours, and service standards. We coordinate staffing, training, scheduling, supervision, and performance reporting within the agreed scope.",
        ],
      },
      {
        type: "p",
        text: ["Our implementation approach is structured around ", { text: "the first 90 days", href: "/how-it-works" }, ":"],
      },
      {
        type: "defs",
        items: [
          {
            lead: "Days 1 to 30: Launch.",
            text: "Define requirements, prepare the team, establish workflows, and begin operations.",
          },
          { lead: "Days 31 to 60: Stabilize.", text: "Monitor performance, coach the team, and improve operational processes." },
          { lead: "Days 61 to 90: Review.", text: "Evaluate results and identify opportunities for improvement or expansion." },
        ],
      },
      { type: "p", text: ["Actual timelines depend on your requirements and staffing needs."] },
      {
        type: "p",
        text: [
          "Our agency has documented experience supporting international businesses, including software companies, and our work can be reviewed through our ",
          { text: "public Upwork agency profile", href: "https://www.upwork.com/agencies/1296021528865828864/" },
          ".",
        ],
      },

      {
        type: "cta",
        title: "Ready to scale without adding more management work?",
        text: "If your team is experiencing increasing support demands, onboarding delays, or recurring operational workloads, Imperium Solutions can help you evaluate which responsibilities are suitable for outsourcing. Book a 15-minute consultation to discuss your current operations, staffing requirements, and coverage needs.",
      },
    ],
    faq: [
      {
        q: "When should a SaaS company outsource customer support?",
        a: "A SaaS company should consider outsourcing when recurring support workloads exceed internal capacity, coverage gaps affect customer experience, or routine administrative tasks prevent internal employees from focusing on higher-value work.",
      },
      {
        q: "Can outsourced customer support work alongside an internal team?",
        a: "Yes. Outsourced representatives can manage selected routine inquiries, onboarding coordination, and administrative workflows while internal specialists retain responsibility for complex technical issues and strategic customer relationships.",
      },
      {
        q: "Will I lose control over customer support if I outsource?",
        a: "Not necessarily. A well-structured arrangement allows your company to retain control over service standards, responsibilities, escalation rules, and performance expectations.",
      },
      {
        q: "How much does SaaS customer support outsourcing cost?",
        a: "Pricing depends on staffing requirements, coverage hours, technical complexity, communication channels, and management responsibilities. Request a quote based on your actual operational requirements rather than comparing hourly rates alone.",
      },
      {
        q: "Can I outsource customer support without outsourcing everything?",
        a: "Yes. Businesses can begin by delegating selected workflows, such as email support, ticket triage, customer follow-ups, or onboarding administration.",
      },
    ],
    related: [
      { href: "/services", title: "Services", text: "The front office and back office work we run." },
      { href: "/how-it-works", title: "How it works", text: "The first 90 days, step by step." },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-11-26" to "26 November 2026", without touching the clock. */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

function inlineText(parts: Inline[]): string {
  return parts.map((p) => (typeof p === "string" ? p : "b" in p ? p.b : p.text)).join("");
}

/** Every word a reader sees in the body and the FAQ. Used for wordCount and reading time. */
export function postWordCount(post: Post): number {
  const chunks: string[] = [];
  for (const b of post.body) {
    if (b.type === "p") chunks.push(inlineText(b.text));
    else if (b.type === "h2") chunks.push(b.text);
    else if (b.type === "ul") chunks.push(...b.items.map(inlineText));
    else if (b.type === "defs") chunks.push(...b.items.map((i) => `${i.lead} ${i.text}`));
    else chunks.push(b.title, b.text);
  }
  for (const f of post.faq) chunks.push(f.q, f.a);
  return chunks.join(" ").split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(post: Post): number {
  return Math.max(1, Math.round(postWordCount(post) / 230));
}

/** Table of contents: the H2 headings in order, plus the FAQ. */
export function postToc(post: Post): { id: string; text: string }[] {
  const items = post.body.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2").map((b) => ({ id: b.id, text: b.text }));
  if (post.faq.length) items.push({ id: "faq", text: "Frequently asked questions" });
  return items;
}
