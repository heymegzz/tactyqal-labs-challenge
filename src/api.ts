import { article, columns, decode, insertSql, values } from "./posts";
import { authorized, cookie, issue, matches } from "./editor-auth";
import { seeds } from "./seeds";
class Problem extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
const fail = (status: number, code: string, message: string): never => {
  throw new Problem(status, code, message);
};
function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}
async function body(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    return fail(415, "media_type", "Send application/json.");
  const reader = req.body?.getReader();
  if (!reader) return fail(400, "json", "A JSON body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 110000) {
      await reader.cancel();
      return fail(413, "size", "The request is too large.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(await new Blob(chunks as BlobPart[]).text());
  } catch {
    return fail(400, "json", "Invalid JSON.");
  }
}
async function initialize(db: D1Database) {
  if (
    await db
      .prepare("SELECT name FROM initializations WHERE name='edition-1'")
      .first()
  )
    return;
  const statements = seeds.map((s, i) => {
    const date = "2026-11-0" + (3 - i) + "T09:00:00.000Z";
    return db
      .prepare(
        "INSERT INTO posts (" +
          columns +
          ",id,created_at,updated_at,published_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM initializations WHERE name=?)",
      )
      .bind(
        ...values({ ...s, status: "published" }),
        s.slug,
        date,
        date,
        date,
        "edition-1",
      );
  });
  await db.batch([
    ...statements,
    db
      .prepare("INSERT OR IGNORE INTO initializations(name) VALUES (?)")
      .bind("edition-1"),
  ]);
}
function numberParam(raw: string | null, defaultValue: number, max: number) {
  if (raw === null) return defaultValue;
  const n = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(n) || n < 1 || n > max)
    return fail(
      422,
      "pagination",
      "Page or limit is outside its allowed range.",
    );
  return n;
}
async function list(db: D1Database, p: URLSearchParams, admin: boolean) {
  const page = numberParam(p.get("page"), 1, 1000000),
    limit = numberParam(p.get("limit"), 6, 50);
  const terms: string[] = admin ? [] : ["status='published'"],
    args: string[] = [];
  const q = p.get("q")?.trim(),
    cat = p.get("category")?.trim(),
    tag = p.get("tag")?.trim();
  if ([q, cat, tag].some((s) => s && s.length > 160))
    return fail(422, "filter", "Search terms are too long.");
  if (q) {
    terms.push(
      "(instr(lower(title),lower(?))>0 OR instr(lower(excerpt),lower(?))>0)",
    );
    args.push(q, q);
  }
  if (cat) {
    terms.push("category=? COLLATE NOCASE");
    args.push(cat);
  }
  if (tag) {
    terms.push(
      "EXISTS (SELECT 1 FROM json_each(posts.tags) WHERE value=? COLLATE NOCASE)",
    );
    args.push(tag);
  }
  const where = terms.length ? " WHERE " + terms.join(" AND ") : "";
  const [count, rows] = await db.batch([
    db.prepare("SELECT count(*) AS n FROM posts" + where).bind(...args),
    db
      .prepare(
        "SELECT * FROM posts" +
          where +
          " ORDER BY " +
          (admin ? "updated_at" : "published_at") +
          " DESC,id LIMIT ? OFFSET ?",
      )
      .bind(...args, limit, (page - 1) * limit),
  ]);
  return json({
    posts: rows.results.map(decode),
    page,
    limit,
    total: (count.results[0] as { n: number }).n,
  });
}
export async function api(
  request: Request,
  env: Cloudflare.Env,
): Promise<Response> {
  try {
    const url = new URL(request.url),
      path = url.pathname,
      method = request.method;
    const write = !["GET", "HEAD"].includes(method);
    if (
      write &&
      request.headers.get("origin") &&
      request.headers.get("origin") !== url.origin
    )
      return fail(403, "origin", "Cross-origin writes are disabled.");
    if (path === "/api/session") {
      if (method === "GET")
        return json({
          authenticated: await authorized(request, env.ADMIN_KEY),
        });
      if (method === "DELETE")
        return json({ ok: true }, 200, {
          "Set-Cookie": cookie(request, "", 0),
        });
      if (method !== "POST") return fail(405, "method", "Unsupported method.");
      const data = await body(request),
        key = env.ADMIN_KEY;
      if (!key || key.length < 32)
        return fail(503, "configuration", "Editor access is not configured.");
      if (typeof data?.key !== "string" || !(await matches(data.key, key)))
        return fail(401, "authentication", "Access key was not accepted.");
      return json({ authenticated: true }, 200, {
        "Set-Cookie": cookie(request, await issue(key), 3600),
      });
    }
    const match = path.match(/^\/api\/(admin\/)?posts(?:\/([a-z0-9-]+))?\/?$/);
    if (!match) return fail(404, "route", "Endpoint not found.");
    const admin = !!match[1],
      id = match[2];
    if (admin && !(await authorized(request, env.ADMIN_KEY)))
      return fail(401, "authentication", "Sign in to the editor.");
    if (!admin && method !== "GET")
      return fail(405, "method", "This feed is read-only.");
    const db = env.DB;
    if (!db) return fail(503, "database", "Database unavailable.");
    await initialize(db);
    if (method === "GET") {
      if (!id) return await list(db, url.searchParams, admin);
      const row = await db
        .prepare(
          admin
            ? "SELECT * FROM posts WHERE id=?"
            : "SELECT * FROM posts WHERE slug=? AND status='published'",
        )
        .bind(id)
        .first();
      if (!row) return fail(404, "post", "Article not found.");
      return json(decode(row));
    }
    if ((method === "POST" && !id) || (method === "PUT" && id)) {
      const parsed = article.safeParse(await body(request));
      if (!parsed.success)
        return fail(
          422,
          "validation",
          parsed.error.issues
            .map((e) => e.path.join(".") + " — " + e.message)
            .join(" · "),
        );
      const p = parsed.data,
        now = new Date().toISOString();
      if (!id) {
        const key = crypto.randomUUID();
        await db
          .prepare(insertSql)
          .bind(
            ...values(p),
            key,
            now,
            now,
            p.status === "published" ? now : null,
          )
          .run();
        return json(
          decode(
            await db
              .prepare("SELECT * FROM posts WHERE id=?")
              .bind(key)
              .first(),
          ),
          201,
        );
      }
      const version = await requireVersion(db, id, request);
      const result = await db
        .prepare(
          "UPDATE posts SET title=?,slug=?,excerpt=?,content=?,cover=?,category=?,tags=?,status=?,updated_at=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE NULL END,version=version+1 WHERE id=? AND version=? RETURNING *",
        )
        .bind(...values(p), now, p.status, now, id, version)
        .first();
      if (!result)
        return fail(
          409,
          "conflict",
          "This post changed. Reload it before editing.",
        );
      return json(decode(result));
    }
    if (method === "DELETE" && id) {
      const version = await requireVersion(db, id, request);
      const change = await db
        .prepare("DELETE FROM posts WHERE id=? AND version=?")
        .bind(id, version)
        .run();
      if (!change.meta.changes)
        return fail(409, "conflict", "Post changed. Reload it first.");
      return new Response(null, { status: 204 });
    }
    return fail(405, "method", "Unsupported method.");
  } catch (e) {
    if (e instanceof Problem)
      return json({ error: { code: e.code, message: e.message } }, e.status);
    if (/UNIQUE constraint failed: posts.slug/.test(String(e)))
      return json(
        {
          error: {
            code: "slug_taken",
            message: "That slug already belongs to another post.",
          },
        },
        409,
      );
    console.error("API error", String(e));
    return json(
      {
        error: {
          code: "unavailable",
          message: "Unable to complete the request. Please retry.",
        },
      },
      503,
    );
  }
}
async function requireVersion(db: D1Database, id: string, req: Request) {
  const existing = await db
    .prepare("SELECT version FROM posts WHERE id=?")
    .bind(id)
    .first<{ version: number }>();
  if (!existing) return fail(404, "post", "Article not found.");
  const version = req.headers.get("if-match");
  if (!version)
    return fail(428, "precondition", "Send the current version in If-Match.");
  if (version !== String(existing.version))
    return fail(
      409,
      "conflict",
      "This post changed. Reload it before editing.",
    );
  return existing.version;
}
