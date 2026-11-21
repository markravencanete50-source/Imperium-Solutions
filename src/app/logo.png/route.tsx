import { logoImage } from "@/lib/seo/brandImage";

// Wordmark used as the Organization logo in structured data. Replace with the real logo file when one exists.
export function GET() {
  return logoImage();
}
