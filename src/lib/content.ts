// Site wide copy and facts. Edit here, not inside components.
// Figures come from the Imperium Solutions Upwork profile (checked 15 November 2026).

export const site = {
  name: "Imperium Solutions",
  legalName: "Imperium Solutions Inc.",
  tagline: "Your growth partner. Managed customer support and back office operations.",
  description:
    "Managed customer support, virtual assistance, and back office operations for US and international businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  upworkUrl: "https://www.upwork.com/agencies/1296021528865828864/",
  // TODO: confirm the public contact and careers addresses with Imperium.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
  careersEmail: process.env.NEXT_PUBLIC_CAREERS_EMAIL || "careers@example.com",
  copyrightYear: 2026,
  teamCity: "Manila",
  teamZone: "Asia/Manila",
};

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/results", label: "Results" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export type Industry = {
  key: string;
  name: string;
  word: string;
  image: string;
  tag: "Delivered" | "Supported";
  desc: string;
};

export const industries: Industry[] = [
  {
    key: "realestate",
    name: "Real estate",
    word: "real estate",
    image: "var(--img-h-realestate)",
    tag: "Delivered",
    desc: "Administrative and sales support for a UK real estate brokerage.",
  },
  {
    key: "healthcare",
    name: "Healthcare",
    word: "healthcare",
    image: "var(--img-h-healthcare)",
    tag: "Supported",
    desc: "Typical work: appointment scheduling, inbox management, and front desk inquiries. Compliance requirements are scoped with you before launch.",
  },
  {
    key: "property",
    name: "Property management",
    word: "property management",
    image: "var(--img-h-property)",
    tag: "Supported",
    desc: "Typical work: tenant inquiries, maintenance ticket follow ups, and listing administration.",
  },
  {
    key: "ecommerce",
    name: "Ecommerce",
    word: "ecommerce",
    image: "var(--img-h-ecommerce)",
    tag: "Supported",
    desc: "Typical work: order support, customer emails and chat, and CRM updates.",
  },
  {
    key: "crypto",
    name: "Crypto and fintech",
    word: "crypto and fintech",
    image: "var(--img-h-crypto)",
    tag: "Delivered",
    desc: "Round the clock live chat, transaction inquiries, verification support, and escalations. More than 900 hours on record.",
  },
  {
    key: "education",
    name: "Education",
    word: "education",
    image: "var(--img-h-education)",
    tag: "Delivered",
    desc: "Project management, digital operations, and support for college education marketing. 835 hours on record.",
  },
  {
    key: "saas",
    name: "Software and SaaS",
    word: "software and SaaS",
    image: "var(--img-h-saas)",
    tag: "Delivered",
    desc: "Customer success for an AI software company, rated 5 stars.",
  },
];

export const marqueeIndustries = [...industries.map((i) => i.name), "Your industry"];

export const marqueeServices = [
  "Live chat",
  "Email support",
  "Voice support",
  "Ticket management",
  "CRM management",
  "Inbox and calendar",
  "Lead follow ups",
  "Executive assistance",
  "Project tracking",
  "Workflow management",
  "Process documentation",
  "Weekly reporting",
];

export const stats = [
  { value: 100, suffix: "%", label: "Job Success on Upwork" },
  { text: "Top Rated", label: "Agency status on Upwork" },
  { value: 4900, suffix: "+", label: "Hours delivered" },
  { value: 27, label: "Jobs completed" },
  { value: 2020, plain: true, label: "On Upwork since" },
] as const;

export const coverageMarkets = [
  { id: "et", label: "US Eastern", city: "New York", zone: "America/New_York" },
  { id: "ct", label: "US Central", city: "Chicago", zone: "America/Chicago" },
  { id: "pt", label: "US Pacific", city: "Los Angeles", zone: "America/Los_Angeles" },
  { id: "uk", label: "United Kingdom", city: "London", zone: "Europe/London" },
];

// Example windows only. Real coverage hours are agreed per client.
export const coverageWindows = [
  { id: "business", label: "Business hours", from: 9, to: 17 },
  { id: "extended", label: "Extended hours", from: 7, to: 23 },
  { id: "full", label: "Round the clock", from: 0, to: 24 },
];

export const photoCredits = [
  { label: "House", by: "Joshua Dixon, Unsplash", href: "https://unsplash.com/photos/a-row-of-houses-hWH5YLJuoKo" },
  { label: "Stethoscope and laptop", by: "Negative Space, Pexels", href: "https://pexels.com/photo/48604" },
  { label: "Apartment building", by: "Cristian Pineda, Unsplash", href: "https://unsplash.com/photos/apartment-building-with-balconies-against-a-clear-sky-KkYihWTf6Tw" },
  { label: "Packaging", by: "Harper Sunday, Unsplash", href: "https://unsplash.com/photos/an-open-cardboard-box-sitting-on-top-of-a-table-fYH4ShNxuQ8" },
  { label: "Trading charts", by: "Nicholas Cappello, Unsplash", href: "https://unsplash.com/photos/close-up-photo-of-monitor-displaying-graph-Wb63zqJ5gnE" },
  { label: "Lecture hall", by: "Zsófia Hajnal, Unsplash", href: "https://unsplash.com/photos/empty-lecture-hall-with-rows-of-seats-I8PUo5Xk8DU" },
  { label: "Analytics dashboard", by: "Luke Chesser, Unsplash", href: "https://unsplash.com/@lukechesser" },
  { label: "Support headset", by: "Petr Macháček, Unsplash", href: "https://unsplash.com/de/fotos/schwarzes-und-braunes-headset-in-der-nahe-des-laptop-computers-BeVGrXEktIk" },
  { label: "Hands on laptop", by: "Justin Morgan, Unsplash", href: "https://unsplash.com/photos/HEaK1vcFlzg" },
  { label: "Home office", by: "Michael Proctor, Unsplash", href: "https://unsplash.com/photos/a-desk-with-a-computer-on-it-in-front-of-a-window-juQrGxGCjw8" },
  { label: "Headphones and laptop", by: "Dan Farrell, Unsplash", href: "https://unsplash.com/photos/black-wireless-headphones-beside-macbook-pro-FnR2U1lXsBQ" },
];

// Answers the booking form asks for. The same lists drive the form and the server side validation.
export const bookingIndustryOptions: string[] = [...industries.map((i) => i.name), "Other"];

export const bookingNeedOptions = [
  "Manpower and staffing",
  "Marketing",
  "Customer support",
  "Admin and back office",
  "Sales and lead generation",
  "Other",
] as const;

export const bookingBudgetOptions = [
  "Under $1,000",
  "$1,000 to $3,000",
  "$3,000 to $5,000",
  "$5,000 to $10,000",
  "Over $10,000",
  "Not sure yet",
] as const;

// Client reviews, quoted word for word from completed Upwork contracts of Imperium team members.
// Only reviews with written feedback are listed. Do not edit the quotes. Last checked 2026-11-21.
// 2026-11-22: the October 2025 farewell note was removed on purpose (it read as a contract ending).
export type Testimonial = {
  quote: string;
  role: string; // the Upwork job title
  period: string;
  rating: string;
};

export const testimonials: Testimonial[] = [
  {
    quote: "We look forward to working with Tom in the future!",
    role: "Customer Success Manager, AI SaaS company",
    period: "September to October 2025",
    rating: "5.0",
  },
  {
    quote:
      "Tom is smart, quick to understand scope of project and very accessible. Look forward to hiring Tom to be our point of contact for Zen Desk work.",
    role: "Zendesk consultation",
    period: "February 2023",
    rating: "5.0",
  },
];
