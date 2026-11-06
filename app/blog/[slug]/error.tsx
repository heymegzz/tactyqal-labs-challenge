"use client";
export default function ErrorView({ reset }: { reset: () => void }) {
  return (
    <section className="wrap section" role="alert">
      <h1>Unable to open this note.</h1>
      <button onClick={reset}>Try again</button>{" "}
      <a href="/blog">Back to the journal</a>
    </section>
  );
}
