import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * error-capture keeps module-level state, so every test re-imports it fresh
 * (which also re-registers its global listeners on the current jsdom window).
 */
async function loadFresh() {
  vi.resetModules();
  return import("@/lib/error-capture");
}

describe("error-capture", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined when nothing has been captured", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures the Error carried by an 'error' event", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    const error = new Error("boom");

    const event = new Event("error") as ErrorEvent;
    Object.defineProperty(event, "error", { value: error });
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBe(error);
  });

  it("falls back to the event itself when it carries no Error", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    const event = new Event("error");
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBe(event);
  });

  it("captures the reason of an unhandled rejection", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    const reason = new Error("rejected");

    const event = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(event, "reason", { value: reason });
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBe(reason);
  });

  it("consumes: a second read returns undefined", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    const event = new Event("error") as ErrorEvent;
    Object.defineProperty(event, "error", { value: new Error("once") });
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBeInstanceOf(Error);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("keeps the most recent error when several arrive", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    for (const message of ["first", "second"]) {
      const event = new Event("error") as ErrorEvent;
      Object.defineProperty(event, "error", { value: new Error(message) });
      globalThis.dispatchEvent(event);
    }

    expect((consumeLastCapturedError() as Error).message).toBe("second");
  });

  it("expires an error older than the 5s TTL", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    const event = new Event("error") as ErrorEvent;
    Object.defineProperty(event, "error", { value: new Error("stale") });
    globalThis.dispatchEvent(event);

    vi.advanceTimersByTime(5_001);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("still returns an error captured just inside the TTL", async () => {
    const { consumeLastCapturedError } = await loadFresh();
    const event = new Event("error") as ErrorEvent;
    Object.defineProperty(event, "error", { value: new Error("fresh") });
    globalThis.dispatchEvent(event);

    vi.advanceTimersByTime(4_999);
    expect(consumeLastCapturedError()).toBeInstanceOf(Error);
  });
});
