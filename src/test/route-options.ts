// Typed accessors for route option callbacks.
//
// TanStack types `head` and `loader` as unions (sync or async, function or
// object), so calling them straight from a test trips the compiler even though
// this app's routes are plain synchronous functions. These helpers do the
// narrowing once, here, instead of scattering casts through the tests.

export type MetaTag = {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  charSet?: string;
};

type Head = { meta?: MetaTag[]; links?: Record<string, unknown>[] };

/** Call a route's `head` and return its resolved tags. */
export function routeHead(head: unknown, args: unknown = {}): Head {
  return (head as (a: unknown) => Head)(args);
}

/** Call a route's `head` and return just its meta tags. */
export function routeMeta(head: unknown, args: unknown = {}): MetaTag[] {
  return routeHead(head, args).meta ?? [];
}

/** Call a route's `loader` with hand-built context. */
export function routeLoader<T>(loader: unknown, args: unknown): T {
  return (loader as (a: unknown) => T)(args);
}
