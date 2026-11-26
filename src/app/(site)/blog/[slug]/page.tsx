import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { Photo, RelatedLinks } from "@/components/site/bits";
import { PostBody, PostCard, PostMeta } from "@/components/site/blog";
import { getPost, postToc, posts } from "@/lib/blog/posts";
import { site } from "@/lib/content";
import { ogImageAlt, ogImageUrl } from "@/lib/seo/config";
import { seoPages } from "@/lib/seo/pages";
import { postGraph, postPath } from "@/lib/seo/schema";

// Every post is prerendered at build time. With cacheComponents, `dynamicParams` is not allowed,
// so an unknown slug is rejected with notFound() instead.
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const path = postPath(post);
  return {
    title: { absolute: post.title },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: path },
    authors: [{ name: site.name, url: "/about" }],
    openGraph: {
      type: "article",
      siteName: site.name,
      locale: "en_US",
      url: path,
      title: post.title,
      description: post.description,
      publishedTime: post.published,
      modifiedTime: post.updated,
      section: post.section,
      tags: post.keywords,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [{ url: ogImageUrl, alt: ogImageAlt }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const toc = postToc(post);
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={postGraph(post)} />
      <section className="page-hero has-img post-hero">
        <div className="wrap page-hero-grid">
          <div className="page-hero-text">
            <PostMeta post={post} />
            <h1 id="post-title">{post.title}</h1>
            <p>{post.excerpt}</p>
          </div>
          <div className="page-hero-img">
            <Photo image={`url("${post.image.src}")`} alt={post.image.alt} />
          </div>
        </div>
      </section>
      <nav className="crumbs" aria-label="Breadcrumb">
        <div className="wrap">
          <ol className="plain">
            <li>
              <Link href="/">{seoPages["/"].crumb}</Link>
            </li>
            <li>
              <Link href="/blog">{seoPages["/blog"].crumb}</Link>
            </li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </div>
      </nav>
      <section className="band legal-page">
        <div className="wrap legal-grid">
          <nav className="toc post-toc" aria-label="In this article">
            <p>In this article</p>
            <ol className="plain">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{t.text}</a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="prose post-prose" aria-labelledby="post-title">
            <PostBody post={post} />
          </article>
        </div>
      </section>
      {more.length ? (
        <section className="band band--raise" aria-labelledby="more-title">
          <div className="wrap">
            <h2 id="more-title" className="more-title">
              More from the blog
            </h2>
            <ul className="plain post-grid">
              {more.map((p, i) => (
                <PostCard key={p.slug} post={p} index={i} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <RelatedLinks items={post.related} tone={more.length ? "ink" : "raise"} />
    </>
  );
}
