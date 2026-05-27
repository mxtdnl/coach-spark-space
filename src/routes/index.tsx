import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EXERCISES, getCategories } from "@/lib/exercises";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coaching Exercise Library — Interactive Worksheets" },
      {
        name: "description",
        content:
          "A growing library of interactive coaching exercises. Pick one, work through it online, and walk away with a clear result.",
      },
      { property: "og:title", content: "Coaching Exercise Library" },
      {
        property: "og:description",
        content:
          "Interactive versions of coaching exercises — no printing required.",
      },
    ],
  }),
  component: LibraryHome,
});

function LibraryHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const categories = getCategories();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (category && e.category !== category) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Coaching Exercise Library
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Interactive versions of coaching worksheets. Pick one, work through it
            online, and get a clear result without printing anything.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                category === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No exercises match your search.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((e) => (
              <li key={e.slug}>
                <Link
                  to="/exercise/$slug"
                  params={{ slug: e.slug }}
                  className="block h-full rounded-xl border border-border bg-card p-6 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {e.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ~{e.estimatedMinutes} min
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold tracking-tight">
                    {e.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {e.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 text-sm font-medium text-primary">
                    Start exercise →
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground text-center pt-8">
          More exercises coming soon. Send a PDF to add it to the library.
        </p>
      </main>
    </div>
  );
}
