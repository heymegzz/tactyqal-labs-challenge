"use client";
import { useEffect, useState } from "react";
import type { Post } from "@/src/posts";
export function Feed({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState(""),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(1),
    [retry, setRetry] = useState(0),
    [data, setData] = useState<{ posts: Post[]; total: number } | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    const ac = new AbortController();
    setError(false);
    setData(null);
    const timer = setTimeout(
      () => {
        fetch(
          "/api/posts?" +
            new URLSearchParams({
              page: String(page),
              limit: compact ? "3" : "6",
              q,
              category,
            }),
          { signal: ac.signal },
        )
          .then(async (r) => {
            if (!r.ok) throw Error();
            return r.json() as Promise<{ posts: Post[]; total: number }>;
          })
          .then(setData)
          .catch((e) => {
            if (e.name !== "AbortError") setError(true);
          });
      },
      q ? 180 : 0,
    );
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [q, category, page, retry, compact]);
  return (
    <>
      {!compact && (
        <div className="filters">
          <label>
            Search articles
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search titles or excerpts"
            />
          </label>
          <label>
            Category
            <input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. Research"
            />
          </label>
        </div>
      )}
      {error ? (
        <div role="alert" className="notice">
          The journal couldn’t load.{" "}
          <button onClick={() => setRetry(retry + 1)}>Try again</button>
        </div>
      ) : !data ? (
        <p className="notice" role="status">
          Opening the journal…
        </p>
      ) : !data.posts.length ? (
        <div className="notice" role="status">
          No articles found.
          {(q || category) && (
            <button
              onClick={() => {
                setQ("");
                setCategory("");
                setPage(1);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="notes">
            {data.posts.map((p) => (
              <a key={p.id} href={"/blog/" + p.slug}>
                <img src={p.cover} alt="" loading="lazy" />
                <div>
                  <span className="eyebrow">{p.category}</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </div>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
          {!compact && data.total > 6 && (
            <div className="actions">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {Math.ceil(data.total / 6)}
              </span>
              <button
                disabled={page * 6 >= data.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
