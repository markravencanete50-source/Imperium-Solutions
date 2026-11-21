import type { MetadataRoute } from "next";
import { ORIGIN } from "@/lib/seo/config";

// Search and AI crawlers are named explicitly and allowed. A crawler that matches a named group ignores
// the "*" group, so the same disallow list is repeated in every group.
const disallow = ["/admin", "/api"];

const crawlers = [
  "Googlebot",
  "Bingbot",
  "Applebot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: crawlers, allow: "/", disallow },
      { userAgent: "*", allow: "/", disallow },
    ],
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
