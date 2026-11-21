import Link from "next/link";
import { seoPages, type SeoPath } from "@/lib/seo/pages";

/** Reusable internal link block. Pass the paths to link to; copy comes from the SEO page data. */
export default function RelatedPages({ paths, title = "Related pages" }: { paths: SeoPath[]; title?: string }) {
  return (
    <aside className="band related" aria-label={title}>
      <div className="wrap">
        <h2>{title}</h2>
        <ul className="plain related-list">
          {paths.map((p) => (
            <li key={p}>
              <Link href={p}>{seoPages[p].crumb}</Link>
              <span>{seoPages[p].title}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
