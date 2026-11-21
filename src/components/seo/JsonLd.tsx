import type { JsonLdGraph, JsonLdNode } from "@/lib/seo/schema";

/** Server rendered JSON-LD. "<" is escaped so the payload cannot close the script tag. */
export default function JsonLd({ data }: { data: JsonLdGraph | JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
