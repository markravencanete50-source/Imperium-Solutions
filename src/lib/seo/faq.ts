// Home page FAQ. Every answer restates facts already shown elsewhere on the site.
// Plain text only (no markup) so the same strings feed the visible answers and the FAQPage JSON-LD.

import { site } from "@/lib/content";

export const homeFaq: { q: string; a: string }[] = [
  {
    q: "What does Imperium Solutions do?",
    a: "Imperium Solutions provides managed customer support, virtual assistance, and back office operations for US and international businesses. You set the responsibilities, coverage hours, and service standards. Imperium recruits, trains, supervises, and reports on the team.",
  },
  {
    q: "How long does it take to launch a team?",
    a: "Every engagement follows the same 90 day plan. Days 1 to 30 cover requirements, staffing, training, go live, and KPIs. Days 31 to 60 stabilize quality and workflows. Days 61 to 90 review performance with you. Timelines depend on project scope and staffing requirements.",
  },
  {
    q: "What do you need from me to get started?",
    a: "A point of contact, your requirements, coverage hours, system access, any product documentation you have, and your approval of the service standards. If your processes are not documented yet, Imperium can help organize them.",
  },
  {
    q: "What hours and time zones can the team cover?",
    a: "Coverage can be business hours, extended hours, or round the clock, for US Eastern, Central, and Pacific time and for the United Kingdom. Your exact coverage windows are written into the service standards before launch.",
  },
  {
    q: "Which industries do you work with?",
    a: "Imperium accepts every industry. Delivered work includes real estate, crypto and fintech, education, and software. Healthcare, property management, and ecommerce are supported, and any compliance requirements are scoped with you before launch.",
  },
  {
    q: "How can I check your track record?",
    a: `Our figures come from our public Upwork profile: Top Rated agency status, 100% Job Success across 27 jobs, and more than 4,900 hours delivered. You can read each client rating at ${site.upworkUrl}`,
  },
];
