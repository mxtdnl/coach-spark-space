import { describe, expect, it } from "vitest";

import { getGreeting } from "@/lib/api/example.functions";

// The handler body runs only inside the Start server runtime (it reads the
// request context out of AsyncLocalStorage), so what a unit test can pin down
// is the call contract the client relies on.
describe("getGreeting server function", () => {
  it("is callable from the client", () => {
    expect(typeof getGreeting).toBe("function");
  });

  it("is declared as a POST, so arguments never land in a URL", () => {
    expect((getGreeting as unknown as { method: string }).method).toBe("POST");
  });

  it("exposes the server-side executor the runtime dispatches to", () => {
    expect(typeof (getGreeting as unknown as { __executeServer: unknown }).__executeServer).toBe(
      "function",
    );
  });

  it("refuses to run outside the server runtime rather than failing silently", async () => {
    await expect(getGreeting({ data: { name: "Ada" } })).rejects.toThrow(/Start context/i);
  });
});
