import { headers } from "next/headers";
import { env } from "cloudflare:workers";
import { authorized } from "@/src/editor-auth";
import { Editor, Login } from "@/components/Editor";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Journal editor",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const signed = await authorized(
    new Request("https://internal/admin", { headers: await headers() }),
    env.ADMIN_KEY,
  );
  return (
    <section className="wrap adminbox">
      <div className="eyebrow">Field notes / Private workspace</div>
      <h1 className="pagetitle">
        Journal <em>editor.</em>
      </h1>
      {signed ? <Editor /> : <Login />}
    </section>
  );
}
