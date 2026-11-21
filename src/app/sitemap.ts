import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/config";
import { CONTENT_LAST_MODIFIED, seoPages, seoPaths } from "@/lib/seo/pages";

// Every indexable public route. /admin and /api are excluded on purpose.
// lastModified is a fixed constant (cacheComponents forbids new Date() while prerendering).
export default function sitemap(): MetadataRoute.Sitemap {
  return seoPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: seoPages[path].changeFrequency,
    priority: seoPages[path].priority,
  }));
}
