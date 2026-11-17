import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/services", "/how-it-works", "/results", "/industries", "/about", "/contact", "/careers", "/privacy"];
  return paths.map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
