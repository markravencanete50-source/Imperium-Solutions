import Link from "next/link";
import { formatPostDate, readingMinutes, type Block, type Inline, type Post } from "@/lib/blog/posts";
import { Icon } from "./icons";
import { delay } from "./bits";

// Server components for the blog: the article body, the FAQ, and the card used on /blog.

function Text({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === "string") return p;
        if ("b" in p) return <strong key={i}>{p.b}</strong>;
        if (p.href.startsWith("/")) {
          return (
            <Link key={i} href={p.href}>
              {p.text}
            </Link>
          );
        }
        return (
          <a key={i} href={p.href} target="_blank" rel="noopener">
            {p.text}
          </a>
        );
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <Text parts={block.text} />
        </p>
      );
    case "h2":
      return <h2 id={block.id}>{block.text}</h2>;
    case "ul":
      return (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}>
              <Text parts={it} />
            </li>
          ))}
        </ul>
      );
    case "defs": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={`plain post-defs${block.ordered ? " post-defs--num" : ""}`}>
          {block.items.map((it) => (
            <li key={it.lead}>
              <strong>{it.lead}</strong> {it.text}
            </li>
          ))}
        </List>
      );
    }
    case "cta":
      return (
        <aside className="post-cta" aria-labelledby="post-cta-title">
          <h2 id="post-cta-title">{block.title}</h2>
          <p>{block.text}</p>
          <div className="actions">
            <Link className="btn btn--amber" href="/contact">
              Book a 15 minute consultation
            </Link>
            <Link className="btn btn--ghost" href="/contact#estimate">
              Request an estimate
            </Link>
          </div>
        </aside>
      );
  }
}

/** The article, then its FAQ, then the closing call to action (the order of the source document). */
export function PostBody({ post }: { post: Post }) {
  const main = post.body.filter((b) => b.type !== "cta");
  const closing = post.body.filter((b) => b.type === "cta");
  return (
    <>
      {main.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
      {post.faq.length ? (
        <>
          <h2 id="faq">Frequently asked questions</h2>
          <div className="faq post-faq">
            {post.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </>
      ) : null}
      {closing.map((b, i) => (
        <BlockView key={`c${i}`} block={b} />
      ))}
    </>
  );
}

/** Section, date, and reading time. Separated by layout, not by symbols (client rule). */
export function PostMeta({ post, as: Tag = "p" }: { post: Post; as?: "p" | "span" }) {
  return (
    <Tag className="post-meta">
      <span>{post.section}</span>
      <time dateTime={post.published}>{formatPostDate(post.published)}</time>
      <span>{readingMinutes(post)} minute read</span>
    </Tag>
  );
}

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <li data-reveal="" style={delay(index * 90)}>
      <Link className="post-card" href={`/blog/${post.slug}`}>
        <span className="post-card-ph" role="img" aria-label={post.image.alt}>
          <span className="post-card-img" style={{ backgroundImage: `url("${post.image.src}")` }} />
        </span>
        <span className="post-card-body">
          <PostMeta post={post} as="span" />
          <span className="post-card-title">{post.title}</span>
          <span className="post-card-text">{post.excerpt}</span>
          <span className="post-card-more">
            Read the article
            <Icon name="arrow" size={18} />
          </span>
        </span>
      </Link>
    </li>
  );
}
