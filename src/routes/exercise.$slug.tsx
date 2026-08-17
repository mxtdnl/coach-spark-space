import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getExercise } from "@/lib/exercises";

export const Route = createFileRoute("/exercise/$slug")({
  loader: ({ params }) => {
    const exercise = getExercise(params.slug);
    if (!exercise) throw notFound();
    // Return only serializable metadata; the component is resolved client-side.
    return {
      slug: exercise.slug,
      title: exercise.title,
      description: exercise.description,
      category: exercise.category,
      tags: exercise.tags,
      estimatedMinutes: exercise.estimatedMinutes,
    };
  },
  head: ({ loaderData }) => {
    const e = loaderData?.exercise;
    if (!e) return { meta: [{ title: "Exercise not found" }] };
    return {
      meta: [
        { title: `${e.title} — Coaching Exercise Library` },
        { name: "description", content: e.description },
        { property: "og:title", content: e.title },
        { property: "og:description", content: e.description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Exercise not found</h1>
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Back to library
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  ),
  component: ExercisePage,
});

function ExercisePage() {
  const { exercise } = Route.useLoaderData();
  const Component = exercise.component;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Library
            </Link>
            <h1 className="text-lg font-semibold tracking-tight truncate">
              {exercise.title}
            </h1>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {exercise.category} · ~{exercise.estimatedMinutes} min
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Component />
      </main>
    </div>
  );
}
