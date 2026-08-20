// Global test environment setup, loaded by vitest.config.ts before every file.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { resetMatchMedia } from "./matchMedia";

// ---------------------------------------------------------------------------
// Browser APIs jsdom does not implement, but the app (and Radix primitives)
// call unconditionally.
// ---------------------------------------------------------------------------

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!("ResizeObserver" in globalThis)) {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
}

if (!("IntersectionObserver" in globalThis)) {
  class IntersectionObserverStub {
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
}

// Radix and a few exercises use pointer capture / scrollIntoView, neither of
// which exists in jsdom.
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView ??= function scrollIntoView() {};
  Element.prototype.hasPointerCapture ??= function hasPointerCapture() {
    return false;
  };
  Element.prototype.setPointerCapture ??= function setPointerCapture() {};
  Element.prototype.releasePointerCapture ??= function releasePointerCapture() {};
}

// jsdom *defines* these but every call logs "Not implemented" through
// console.error, so they are replaced outright rather than defaulted.
if (typeof window !== "undefined") {
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  window.scroll = (() => {}) as typeof window.scroll;
  // Several exercises offer a printable summary; jsdom cannot print.
  window.print = (() => {}) as typeof window.print;
}

// ---------------------------------------------------------------------------
// Per-test isolation. Every test starts with an empty device: no saved
// answers, no theme choice, light OS preference.
// ---------------------------------------------------------------------------

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
  resetMatchMedia();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
