import Link from "next/link";
import { seoPages, type SeoPath } from "@/lib/seo/pages";
import { pageGraph } from "@/lib/seo/schema";
import JsonLd from "./JsonLd";

/**
 * One line per page: places the page's JSON-LD graph (Organization, WebSite, WebPage, BreadcrumbList,
 * and Service entries on /services). On inner pages it also renders a visible breadcrumb trail,
 * which the BreadcrumbList describes. The home page gets structured data only.
 */
export default function Breadcrumbs({ path }: { path: SeoPath }) {
  const here = seoPages[path];
  return (
    <>
      <JsonLd data={pageGraph(path)} />
      {path === "/" ? null : (
        <nav className="crumbs" aria-label="Breadcrumb">
          <div className="wrap">
            <ol className="plain">
              <li>
                <Link href="/">{seoPages["/"].crumb}</Link>
              </li>
              <li aria-current="page">{here.crumb}</li>
            </ol>
          </div>
        </nav>
      )}
    </>
  );
}
