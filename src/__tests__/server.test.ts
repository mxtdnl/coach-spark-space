import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.mock("@tanstack/react-start/server-entry", () => ({
  default: {
    fetch: (...args: unknown[]) => fetchMock(...args),
  },
}));

/** The h3 body that hides a real SSR crash behind a generic 500. */
const SWALLOWED = JSON.stringify({ unhandled: true, message: "HTTPError" });
const json = (body: string, status = 500) =>
  new Response(body, { status, headers: { "content-type": "application/json" } });

async function loadServer() {
  vi.resetModules();
  const module = await import("@/server");
  return module.default;
}

describe("SSR entry (src/server.ts)", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes a successful response straight through", async () => {
    const expected = new Response("<h1>hello</h1>", { status: 200 });
    fetchMock.mockResolvedValue(expected);

    const server = await loadServer();
    const response = await server.fetch(new Request("https://example.test/"), {}, {});
    expect(response).toBe(expected);
  });

  it("forwards the request, env and context to the real entry", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));
    const request = new Request("https://example.test/exercise/ikigai");
    const env = { KEY: "value" };
    const ctx = { waitUntil: () => {} };

    const server = await loadServer();
    await server.fetch(request, env, ctx);
    expect(fetchMock).toHaveBeenCalledWith(request, env, ctx);
  });

  it("leaves a 4xx alone", async () => {
    const expected = new Response("nope", { status: 404 });
    fetchMock.mockResolvedValue(expected);

    const server = await loadServer();
    expect(await server.fetch(new Request("https://example.test/"), {}, {})).toBe(expected);
  });

  it("leaves a genuine JSON 500 from the app alone", async () => {
    const expected = json(JSON.stringify({ error: "database unavailable" }));
    fetchMock.mockResolvedValue(expected);

    const server = await loadServer();
    expect(await server.fetch(new Request("https://example.test/"), {}, {})).toBe(expected);
  });

  it("leaves a non-JSON 500 alone", async () => {
    const expected = new Response("<h1>my own error page</h1>", {
      status: 500,
      headers: { "content-type": "text/html" },
    });
    fetchMock.mockResolvedValue(expected);

    const server = await loadServer();
    expect(await server.fetch(new Request("https://example.test/"), {}, {})).toBe(expected);
  });

  it("replaces an h3-swallowed 500 with the readable error page", async () => {
    fetchMock.mockResolvedValue(json(SWALLOWED));

    const server = await loadServer();
    const response = await server.fetch(new Request("https://example.test/"), {}, {});

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    await expect(response.text()).resolves.toContain("This page didn't load");
  });

  it("logs the captured original error rather than the generic h3 body", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(json(SWALLOWED));

    const server = await loadServer();
    const original = new Error("the real cause");
    const event = new Event("error") as ErrorEvent;
    Object.defineProperty(event, "error", { value: original });
    globalThis.dispatchEvent(event);

    await server.fetch(new Request("https://example.test/"), {}, {});
    expect(logged).toHaveBeenCalledWith(original);
  });

  it("falls back to logging the h3 body when no error was captured", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(json(SWALLOWED));

    const server = await loadServer();
    await server.fetch(new Request("https://example.test/"), {}, {});

    const [logged1] = logged.mock.calls.at(-1)!;
    expect((logged1 as Error).message).toContain("h3 swallowed SSR error");
  });

  it("returns the error page when the entry itself throws", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const boom = new Error("entry exploded");
    fetchMock.mockRejectedValue(boom);

    const server = await loadServer();
    const response = await server.fetch(new Request("https://example.test/"), {}, {});

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toContain("This page didn't load");
    expect(logged).toHaveBeenCalledWith(boom);
  });

  it("does not consume the original response body", async () => {
    // The swallow check clones before reading, so a passed-through response is
    // still readable by the platform.
    const expected = json(JSON.stringify({ error: "real" }));
    fetchMock.mockResolvedValue(expected);

    const server = await loadServer();
    const response = await server.fetch(new Request("https://example.test/"), {}, {});
    await expect(response.text()).resolves.toContain("real");
  });

  it("imports the server entry once and reuses it", async () => {
    fetchMock.mockResolvedValue(new Response("ok"));
    const server = await loadServer();

    await server.fetch(new Request("https://example.test/a"), {}, {});
    await server.fetch(new Request("https://example.test/b"), {}, {});
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
