// SEO facts for every public page. One place for titles, descriptions, and schema types.
// Descriptions are answer first and kept between 140 and 160 characters.
// No em dashes, emojis, or decorative symbols (client rule).

export type SeoPath =
  | "/"
  | "/services"
  | "/how-it-works"
  | "/results"
  | "/testimonials"
  | "/industries"
  | "/about"
  | "/contact"
  | "/careers"
  | "/privacy"
  | "/credits";

export type SeoPage = {
  path: SeoPath;
  /** Page title. The root template appends " | Imperium Solutions" (the home page uses an absolute title). */
  title: string;
  /** Short name used in breadcrumbs. */
  crumb: string;
  description: string;
  schemaType: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

export const seoPages: Record<SeoPath, SeoPage> = {
  "/": {
    path: "/",
    title: "Managed Support and Back Office Teams",
    crumb: "Home",
    description:
      "Imperium Solutions provides managed customer support, virtual assistance, and back office teams for US and international businesses, run on your hours.",
    schemaType: "WebPage",
    changeFrequency: "weekly",
    priority: 1,
  },
  "/services": {
    path: "/services",
    title: "Customer Support and Back Office Services",
    crumb: "Services",
    description:
      "Imperium runs managed customer support, virtual assistance, administration, and project operations teams, recruited, trained, and supervised for you.",
    schemaType: "CollectionPage",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  "/how-it-works": {
    path: "/how-it-works",
    title: "How It Works: Your First 90 Days",
    crumb: "How it works",
    description:
      "An Imperium engagement runs in 90 days: launch in days 1 to 30, stabilize in days 31 to 60, review in days 61 to 90. See what you define and what we manage.",
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  "/results": {
    path: "/results",
    title: "Results and Upwork Track Record",
    crumb: "Results",
    description:
      "Imperium holds 100% Job Success across 27 Upwork jobs and 4,900+ hours delivered. See the engagements on record, from round the clock chat to operations.",
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  "/testimonials": {
    path: "/testimonials",
    title: "Client Testimonials and Upwork Reviews",
    crumb: "Testimonials",
    description:
      "Read what clients say about Imperium Solutions. Every written review from our team's completed Upwork contracts, quoted word for word, with its rating.",
    schemaType: "WebPage",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  "/industries": {
    path: "/industries",
    title: "Support Teams for Every Industry",
    crumb: "Industries",
    description:
      "Imperium supports every industry. Delivered work spans real estate, crypto and fintech, education, and software, plus healthcare, property, and ecommerce.",
    schemaType: "CollectionPage",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  "/about": {
    path: "/about",
    title: "About Our Managed Teams",
    crumb: "About",
    description:
      "Imperium Solutions Inc. is a Top Rated Upwork agency of 11 to 50 people. Our teams work from home on your hours, with supervision and quality checks included.",
    schemaType: "AboutPage",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  "/contact": {
    path: "/contact",
    title: "Book a Consultation or Request an Estimate",
    crumb: "Contact",
    description:
      "Book a 15 minute consultation with Imperium Solutions, or send the details of your support or back office needs and we will reply with an estimate.",
    schemaType: "ContactPage",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  "/careers": {
    path: "/careers",
    title: "Careers: Work From Home Support Roles",
    crumb: "Careers",
    description:
      "Imperium hires customer support, virtual assistant, and operations people who work from home on client hours. Email your resume with the role you want.",
    schemaType: "WebPage",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  "/privacy": {
    path: "/privacy",
    title: "Privacy Policy",
    crumb: "Privacy Policy",
    description:
      "How Imperium Solutions collects, uses, stores, and protects the details you send through this website, how long we keep them, and how to ask us to delete them.",
    schemaType: "WebPage",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  "/credits": {
    path: "/credits",
    title: "Photo Credits",
    crumb: "Photo credits",
    description:
      "Credits for the photographs used on the Imperium Solutions website, with the name of each photographer and a link to the original image on Unsplash or Pexels.",
    schemaType: "WebPage",
    changeFrequency: "yearly",
    priority: 0.1,
  },
};

export const seoPaths = Object.keys(seoPages) as SeoPath[];

/** Fixed date for sitemap lastModified and schema dateModified. Update when page content changes. */
export const CONTENT_LAST_MODIFIED = "2026-11-22";
