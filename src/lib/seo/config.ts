import { site } from "@/lib/content";

/** Canonical origin without a trailing slash. In production this is https://imperiumsolutionsinc.com. */
export const ORIGIN = site.url.replace(/\/+$/, "");

/** Absolute URL for a site path. The home page is the bare origin, which is also how Next prints its canonical. */
export function absoluteUrl(path: string): string {
  return path === "/" || path === "" ? ORIGIN : `${ORIGIN}${path}`;
}

/** Stable schema.org node ids so every page can point at the same entities. */
export const ids = {
  org: `${ORIGIN}/#organization`,
  website: `${ORIGIN}/#website`,
};

/** Public email, or undefined while the env var is unset and the example placeholder is showing. */
export const publicEmail = site.contactEmail.endsWith("@example.com") ? undefined : site.contactEmail;

/** Real public profiles only. Add a profile here once it exists and is linked on the site. */
export const sameAs: string[] = [site.upworkUrl];

/** Social sharing card, see src/app/og.png/route.tsx. */
export const ogImageUrl = `${ORIGIN}/og.png`;
export const ogImageAlt = "Imperium Solutions: managed support and back office teams";

export const logoUrl = `${ORIGIN}/logo.png`;

/** Fragment id on a page, for schema.org @id values. The home page is the origin plus a slash. */
export function anchor(path: string, fragment: string): string {
  return `${path === "/" || path === "" ? `${ORIGIN}/` : absoluteUrl(path)}#${fragment}`;
}
