import { notFound } from "next/navigation";
import { env } from "cloudflare:workers";
import { api } from "@/src/api";
import { Story } from "@/components/Story";
export const dynamic = "force-dynamic";
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await api(
    new Request("https://internal/api/posts/" + encodeURIComponent(slug)),
    env,
  );
  if (r.status === 404) notFound();
  if (!r.ok) throw Error("Cannot open article");
  const post = (await r.json()) as import("@/src/posts").Post;
  return (
    <section className="wrap articlepage">
      <a className="textlink" href="/blog">
        ← All field notes
      </a>
      <Story post={post} date={post.published_at} />
    </section>
  );
}
