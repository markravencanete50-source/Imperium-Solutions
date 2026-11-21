import { site } from "@/lib/content";
import { absoluteUrl, anchor, ids, logoUrl, publicEmail, sameAs } from "./config";
import { CONTENT_LAST_MODIFIED, seoPages, type SeoPath } from "./pages";
import { seoServices } from "./services";

// Small typed helpers for schema.org JSON-LD. Everything marked up here is visible on the page.

export type JsonLdNode = { "@type": string; "@id"?: string; [key: string]: unknown };
export type JsonLdGraph = { "@context": "https://schema.org"; "@graph": JsonLdNode[] };

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ids.org,
    name: site.legalName,
    alternateName: site.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: logoUrl, width: 512, height: 512 },
    description: site.description,
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 11, maxValue: 50 },
    sameAs,
    ...(publicEmail
      ? {
          email: publicEmail,
          contactPoint: [
            { "@type": "ContactPoint", contactType: "customer support", email: publicEmail, availableLanguage: "English" },
          ],
        }
      : {}),
  };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: absoluteUrl("/"),
    name: site.name,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": ids.org },
  };
}

export function breadcrumbNode(path: SeoPath): JsonLdNode {
  const here = seoPages[path];
  return {
    "@type": "BreadcrumbList",
    "@id": anchor(path, "breadcrumb"),
    itemListElement: [
      { "@type": "ListItem", position: 1, name: seoPages["/"].crumb, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: here.crumb, item: absoluteUrl(path) },
    ],
  };
}

export function webPageNode(path: SeoPath): JsonLdNode {
  const page = seoPages[path];
  const url = absoluteUrl(path);
  return {
    "@type": page.schemaType,
    "@id": anchor(path, "webpage"),
    url,
    name: path === "/" ? `${site.name} | ${page.title}` : `${page.title} | ${site.name}`,
    description: page.description,
    inLanguage: "en",
    dateModified: CONTENT_LAST_MODIFIED,
    isPartOf: { "@id": ids.website },
    about: { "@id": ids.org },
    publisher: { "@id": ids.org },
    ...(path === "/" ? {} : { breadcrumb: { "@id": anchor(path, "breadcrumb") } }),
  };
}

export function serviceNodes(): JsonLdNode[] {
  return seoServices.map((s) => ({
    "@type": "Service",
    "@id": anchor("/services", s.id),
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    provider: { "@id": ids.org },
    url: absoluteUrl("/services"),
    mainEntityOfPage: { "@id": anchor("/services", "webpage") },
  }));
}

export function faqNode(items: { q: string; a: string }[], path: SeoPath): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": anchor(path, "faq"),
    isPartOf: { "@id": anchor(path, "webpage") },
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/** The graph for a page: organization, website, the page itself, breadcrumbs, and page specific nodes. */
export function pageGraph(path: SeoPath): JsonLdGraph {
  const graph: JsonLdNode[] = [organizationNode(), websiteNode(), webPageNode(path)];
  if (path !== "/") graph.push(breadcrumbNode(path));
  if (path === "/services") graph.push(...serviceNodes());
  return { "@context": "https://schema.org", "@graph": graph };
}
