import type { Metadata } from "next";
import { site } from "@/lib/content";
import { ogImageAlt, ogImageUrl } from "./config";
import { seoPages, type SeoPath } from "./pages";

/**
 * Metadata for a public page. Titles use the root template, so inner pages only give the page part.
 * The canonical resolves against metadataBase. The share image is the brand card at /og.png.
 */
export function pageMetadata(path: SeoPath): Metadata {
  const page = seoPages[path];
  const fullTitle = path === "/" ? `${site.name} | ${page.title}` : `${page.title} | ${site.name}`;
  return {
    title: path === "/" ? { absolute: fullTitle } : page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_US",
      url: path,
      title: fullTitle,
      description: page.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [{ url: ogImageUrl, alt: ogImageAlt }],
    },
  };
}
