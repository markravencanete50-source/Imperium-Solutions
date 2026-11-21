// The real services, matching the service headings and lists on /services (see Services in sections.tsx).
// SEO-only copy: keep every description consistent with what is visible on the page.

export const seoServices = [
  {
    id: "customer-support",
    name: "Customer support",
    serviceType: "Customer support outsourcing",
    description:
      "Live chat, email, and voice support, customer inquiries, onboarding and account assistance, ticket management, follow ups, and escalations, covered in business hours, extended hours, or round the clock.",
  },
  {
    id: "virtual-assistance",
    name: "Virtual assistance and administration",
    serviceType: "Virtual assistant and administrative support",
    description:
      "CRM management and data organization, inbox, calendar, and appointment coordination, sales administration and lead follow ups, and executive assistance.",
  },
  {
    id: "project-operations",
    name: "Project management and operations",
    serviceType: "Project management and operations support",
    description:
      "Project tracking and team coordination, digital operations and workflow management, and process documentation and reporting.",
  },
] as const;
