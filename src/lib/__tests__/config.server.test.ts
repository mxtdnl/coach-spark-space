import { afterEach, describe, expect, it } from "vitest";
import process from "node:process";

import { getServerConfig } from "@/lib/config.server";

const original = process.env.NODE_ENV;
afterEach(() => {
  process.env.NODE_ENV = original;
});

describe("getServerConfig", () => {
  it("reports the current NODE_ENV", () => {
    process.env.NODE_ENV = "production";
    expect(getServerConfig().nodeEnv).toBe("production");
  });

  it("reads the environment on every call, not at import time", () => {
    // On Cloudflare Workers env binds per request, so a module-scope read would
    // be undefined; this is the behaviour that guards against that.
    process.env.NODE_ENV = "development";
    expect(getServerConfig().nodeEnv).toBe("development");

    process.env.NODE_ENV = "test";
    expect(getServerConfig().nodeEnv).toBe("test");
  });

  it("tolerates an unset NODE_ENV", () => {
    delete process.env.NODE_ENV;
    expect(getServerConfig().nodeEnv).toBeUndefined();
  });
});
