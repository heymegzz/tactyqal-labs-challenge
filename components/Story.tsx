import type { Fields } from "@/src/posts";
export function Story({ post, date }: { post: Fields; date?: string | null }) {
  return (
    <article className="story">
      <div className="eyebrow">
        {post.category}
        {date && " / " + date.slice(0, 10)}
      </div>
      <h1>{post.title}</h1>
      <p className="lede">{post.excerpt}</p>
      <img className="storycover" src={post.cover} alt="" />
      <div className="copy">
        {post.content.split(/\n\s*\n/).map((part, i) => (
          <p key={i}>{part}</p>
        ))}
      </div>
      <div className="tags">
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
