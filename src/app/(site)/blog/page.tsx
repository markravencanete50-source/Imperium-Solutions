import type { Metadata } from "next";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";
import { CtaBand, PageHero, SectionHead } from "@/components/site/bits";
import { PostCard } from "@/components/site/blog";
import { posts } from "@/lib/blog/posts";

export const metadata: Metadata = pageMetadata("/blog");

export default function Page() {
  return (
    <>
      <PageHero
        title="Blog"
        lede="Practical guides on customer support, virtual assistance, and back office operations for growing businesses."
        actions="none"
      />
      <Breadcrumbs path="/blog" />
      <section className="band" aria-labelledby="posts-title">
        <div className="wrap">
          <SectionHead id="posts-title" title="Latest articles" />
          <ul className="plain post-grid">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
