// Run against the local built worker. Creates and removes only its own test post.
import assert from "node:assert/strict";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:8787";
if (new URL(origin).hostname !== "127.0.0.1")
  throw Error("Use a loopback test deployment.");
const key = process.env.ADMIN_KEY;
if (!key) throw Error("Set ADMIN_KEY");
let session = "",
  id = "",
  version = 0;
async function req(path, method = "GET", data, extra = {}, auth = false) {
  return fetch(origin + path, {
    method,
    headers: {
      ...(auth ? { Cookie: session } : {}),
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...extra,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}
async function status(res, n) {
  assert.equal(res.status, n, res.status === n ? "" : await res.clone().text());
  return res;
}
const slug = "verification-" + crypto.randomUUID();
const fields = {
  slug,
  title: "Verification manuscript",
  excerpt: "Check database visibility.",
  content: "A real record persisted in local D1.",
  cover: "/art/build.svg",
  category: "Verification",
  tags: ["probe"],
  status: "draft",
};
try {
  await status(await req("/api/admin/posts"), 401);
  await status(await req("/api/admin/posts", "POST", fields), 401);
  await status(await req("/api/posts", "POST", fields), 405);
  await status(await req("/api/session", "POST", { key: "bad" }), 401);
  const login = await status(await req("/api/session", "POST", { key }), 200);
  session = login.headers.get("set-cookie").split(";")[0];
  assert.match(login.headers.get("set-cookie"), /HttpOnly/);
  await status(
    await req(
      "/api/admin/posts",
      "POST",
      fields,
      { Origin: "https://example.org" },
      true,
    ),
    403,
  );
  await status(
    await req(
      "/api/admin/posts",
      "POST",
      { ...fields, slug: "Bad slug" },
      {},
      true,
    ),
    422,
  );
  const made = await (
    await status(await req("/api/admin/posts", "POST", fields, {}, true), 201)
  ).json();
  id = made.id;
  version = made.version;
  await status(await req("/api/posts/" + slug), 404);
  assert.equal((await (await req("/api/posts?q=" + slug)).json()).total, 0);
  await status(await req("/api/admin/posts", "POST", fields, {}, true), 409);
  await status(
    await req("/api/admin/posts/" + id, "PUT", fields, {}, true),
    428,
  );
  const saved = await (
    await status(
      await req(
        "/api/admin/posts/" + id,
        "PUT",
        { ...fields, status: "published" },
        { "If-Match": String(version) },
        true,
      ),
      200,
    )
  ).json();
  await status(
    await req(
      "/api/admin/posts/" + id,
      "PUT",
      fields,
      { "If-Match": String(version) },
      true,
    ),
    409,
  );
  version = saved.version;
  assert.equal((await (await req("/api/posts/" + slug)).json()).id, id);
  const feed = await (
    await req(
      "/api/posts?category=Verification&tag=probe&q=manuscript&limit=1&page=1",
    )
  ).json();
  assert.equal(feed.total, 1);
  assert.equal(feed.posts[0].id, id);
  assert.equal(
    (
      await (
        await req("/api/posts?category=Verification&page=2&limit=1")
      ).json()
    ).posts.length,
    0,
  );
  await status(await req("/api/posts?page=0"), 422);
  const hidden = await (
    await status(
      await req(
        "/api/admin/posts/" + id,
        "PUT",
        fields,
        { "If-Match": String(version) },
        true,
      ),
      200,
    )
  ).json();
  version = hidden.version;
  await status(await req("/api/posts/" + slug), 404);
  await status(
    await req(
      "/api/admin/posts/" + id,
      "DELETE",
      undefined,
      { "If-Match": String(version) },
      true,
    ),
    204,
  );
  id = "";
  await status(await req("/api/posts/" + slug), 404);
  console.log(
    "PASS: authentication, write guards, validation, CRUD, slug conflict, optimistic locking, visibility, search, both filters and pagination.",
  );
} finally {
  if (id)
    await req(
      "/api/admin/posts/" + id,
      "DELETE",
      undefined,
      { "If-Match": String(version) },
      true,
    );
}
