"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Fields, Post } from "@/src/posts";
import { Story } from "./Story";
const empty: Fields = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [],
  cover: "/art/observe.svg",
  status: "draft",
};
type PostList = { posts: Post[]; total: number };
async function call<T = unknown>(path: string, options: RequestInit = {}) {
  const r = await fetch(path, options);
  if (r.status === 204) return null as T;
  const result = (await r.json()) as T & { error?: { message: string } };
  if (!r.ok) throw Error(result?.error?.message || "Request failed.");
  return result;
}
const message = (e: unknown) =>
  e instanceof Error ? e.message : "Unable to complete request.";
export function Login() {
  const [msg, set] = useState(""),
    [busy, wait] = useState(false);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const key = new FormData(e.currentTarget).get("key");
    wait(true);
    try {
      await call("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      location.replace("/admin");
    } catch (err) {
      set(message(err));
      wait(false);
    }
  }
  return (
    <form className="login" onSubmit={login}>
      <label>
        Editor access key
        <input
          name="key"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="button" disabled={busy}>
        Sign in
      </button>
      <p role="status">{msg}</p>
    </form>
  );
}
export function Editor() {
  const [rows, setRows] = useState<Post[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [revision, refresh] = useState(0),
    [selected, pick] = useState<Post | null>(null),
    [draft, set] = useState<Fields>(empty),
    [tags, setTags] = useState(""),
    [msg, notice] = useState(""),
    [busy, wait] = useState(false),
    [preview, show] = useState(false),
    [confirm, ask] = useState(false),
    [dirty, change] = useState(false);
  useEffect(() => {
    let live = true;
    call<PostList>("/api/admin/posts?limit=10&page=" + page)
      .then((v) => {
        if (live) {
          setRows(v.posts);
          setTotal(v.total);
          if (!v.posts.length && page > 1) setPage(page - 1);
        }
      })
      .catch((e) => {
        if (live) notice(message(e));
      });
    return () => {
      live = false;
    };
  }, [page, revision]);
  function select(p: Post | null, force = false) {
    if (!force && dirty && !window.confirm("Discard unsaved edits?")) return;
    pick(p);
    const fields = p
      ? (Object.fromEntries(
          Object.keys(empty).map((k) => [k, p[k as keyof Fields]]),
        ) as Fields)
      : { ...empty };
    set(fields);
    setTags(fields.tags.join(", "));
    ask(false);
    show(false);
    change(false);
    notice("");
  }
  function update(k: keyof Fields, v: string) {
    set((prev) => ({ ...prev, [k]: v }));
    change(true);
  }
  const payload = {
    ...draft,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };
  async function save(e: FormEvent) {
    e.preventDefault();
    wait(true);
    try {
      const p = await call<Post>(
        "/api/admin/posts" + (selected ? "/" + selected.id : ""),
        {
          method: selected ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(selected ? { "If-Match": String(selected.version) } : {}),
          },
          body: JSON.stringify(payload),
        },
      );
      select(p, true);
      refresh((x) => x + 1);
      notice(
        p.status === "published" ? "Published to the journal." : "Draft saved.",
      );
    } catch (err) {
      notice(message(err));
    } finally {
      wait(false);
    }
  }
  async function remove() {
    if (!selected) return;
    wait(true);
    try {
      await call("/api/admin/posts/" + selected.id, {
        method: "DELETE",
        headers: { "If-Match": String(selected.version) },
      });
      select(null, true);
      refresh((x) => x + 1);
      notice("Post deleted.");
    } catch (err) {
      notice(message(err));
    } finally {
      wait(false);
    }
  }
  async function logout() {
    if (dirty && !window.confirm("Discard unsaved edits and sign out?")) return;
    try {
      await call("/api/session", { method: "DELETE" });
      location.replace("/admin");
    } catch (e) {
      notice(message(e));
    }
  }
  return (
    <>
      <div className="adminbar">
        <button onClick={() => select(null)} disabled={busy}>
          + New post
        </button>
        <button onClick={logout}>Sign out</button>
      </div>
      <p aria-live="polite" className={msg ? "msg" : ""}>
        {msg}
      </p>
      <div className="editorgrid">
        <aside aria-label="Saved posts">
          {rows.map((p) => (
            <button disabled={busy} key={p.id} onClick={() => select(p)}>
              <small>{p.status}</small>
              {p.title}
            </button>
          ))}
          {total > 10 && (
            <div className="actions">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <button
                disabled={page * 10 >= total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </aside>
        <form onSubmit={save} className="editor">
          <h2>{selected ? "Edit post" : "New post"}</h2>
          <label>
            Title
            <input
              required
              maxLength={160}
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </label>
          <label>
            Slug
            <input
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={150}
              placeholder="first-field-note"
              value={draft.slug}
              onChange={(e) => update("slug", e.target.value)}
            />
          </label>
          <label>
            Excerpt
            <textarea
              required
              maxLength={400}
              value={draft.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
            />
          </label>
          <label>
            Article text
            <textarea
              required
              rows={9}
              maxLength={65000}
              value={draft.content}
              onChange={(e) => update("content", e.target.value)}
            />
          </label>
          <div className="twocol">
            <label>
              Category
              <input
                required
                maxLength={48}
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
              />
            </label>
            <label>
              Tags (comma separated)
              <input
                value={tags}
                onChange={(e) => {
                  change(true);
                  setTags(e.target.value);
                }}
              />
            </label>
          </div>
          <label>
            Cover image
            <input
              required
              list="covers"
              value={draft.cover}
              onChange={(e) => update("cover", e.target.value)}
            />
            <datalist id="covers">
              {["observe", "shape", "build", "launch"].map((k) => (
                <option key={k} value={"/art/" + k + ".svg"} />
              ))}
            </datalist>
          </label>
          <label>
            Visibility
            <select
              value={draft.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <div className="editactions">
            <button className="button" disabled={busy}>
              {draft.status === "draft" ? "Save draft" : "Publish post"}
            </button>
            <button
              type="button"
              aria-expanded={preview}
              onClick={() => show(!preview)}
            >
              {preview ? "Hide preview" : "Preview"}
            </button>
            {selected && (
              <button
                className="remove"
                type="button"
                onClick={() => ask(!confirm)}
              >
                Delete
              </button>
            )}
            {selected?.status === "published" && (
              <a href={"/blog/" + selected.slug}>View published post ↗</a>
            )}
          </div>
          {confirm && (
            <div className="msg">
              Delete this post permanently?{" "}
              <button type="button" disabled={busy} onClick={remove}>
                Confirm delete
              </button>{" "}
              <button type="button" onClick={() => ask(false)}>
                Cancel
              </button>
            </div>
          )}
          {preview && (
            <div aria-label="Article preview">
              <Story post={payload} />
            </div>
          )}
        </form>
      </div>
    </>
  );
}
