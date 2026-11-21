import { ogImage } from "@/lib/seo/brandImage";

// Stable URL for the social sharing card (1200 by 630). The file convention opengraph-image is not used because
// a page level openGraph export would drop it; pageMetadata() and the root layout reference this URL directly.
export function GET() {
  return ogImage();
}
