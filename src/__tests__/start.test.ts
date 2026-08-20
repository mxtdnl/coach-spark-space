import { describe, expect, it, vi } from "vitest";

import { errorMiddleware, startInstance } from "@/start";

/** The middleware's server handler, as the Start runtime would call it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = (next: () => unknown) => (errorMiddleware as any).options.server({ next } as any);

describe("request error middleware", () => {
  it("passes a successful response through untouched", async () => {
    const expected = new Response("fine", { status: 200 });
    await expect(run(async () => expected)).resolves.toBe(expected);
  });

  it("re-throws control-flow errors that carry a statusCode", async () => {
    // Redirects and notFound() travel as thrown objects with a statusCode and
    // must reach the router, not be turned into an error page.
    const redirect = { statusCode: 302, headers: { location: "/" } };
    await expect(run(async () => Promise.reject(redirect))).rejects.toBe(redirect);
  });

  it("turns an unexpected throw into the readable 500 page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = (await run(async () => {
      throw new Error("kaboom");
    })) as Response;

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    await expect(response.text()).resolves.toContain("This page didn't load");
  });

  it("logs the error it swallowed", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const boom = new Error("kaboom");
    await run(async () => {
      throw boom;
    });
    expect(logged).toHaveBeenCalledWith(boom);
  });

  it("handles a thrown non-Error too", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = (await run(async () => Promise.reject("just a string"))) as Response;
    expect(response.status).toBe(500);
  });

  it("does not mistake a null throw for a statusCode carrier", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = (await run(async () => Promise.reject(null))) as Response;
    expect(response.status).toBe(500);
  });
});

describe("startInstance", () => {
  // The instance keeps its option callback private (getOptions() resolves it
  // lazily inside the Start runtime), so what is asserted here is that the app
  // exports a usable Start instance; the middleware's behaviour is covered above.
  it("exports a configured Start instance", () => {
    expect(startInstance).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(typeof (startInstance as any).getOptions).toBe("function");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(typeof (startInstance as any).createMiddleware).toBe("function");
  });
});
