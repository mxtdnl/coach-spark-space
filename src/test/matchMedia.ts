// A controllable window.matchMedia.
//
// jsdom ships no implementation at all, and two features under test read it:
// the theme system ("(prefers-color-scheme: dark)") and useIsMobile
// ("(max-width: 767px)"). This stub answers both from state the tests own, and
// notifies registered listeners when that state changes — which is what makes
// "follow the OS live" and "react to a resize" testable.
import { vi } from "vitest";

type Listener = (event: MediaQueryListEvent) => void;

const listeners = new Map<string, Set<Listener>>();
let prefersDark = false;

/** Evaluate a media query against the current fake environment. */
function evaluate(query: string): boolean {
  if (query.includes("prefers-color-scheme: dark")) return prefersDark;
  if (query.includes("prefers-color-scheme: light")) return !prefersDark;
  const maxWidth = /max-width:\s*(\d+)px/.exec(query);
  if (maxWidth) return window.innerWidth <= Number(maxWidth[1]);
  const minWidth = /min-width:\s*(\d+)px/.exec(query);
  if (minWidth) return window.innerWidth >= Number(minWidth[1]);
  return false;
}

function notify(query: string) {
  const matches = evaluate(query);
  const event = { matches, media: query } as MediaQueryListEvent;
  listeners.get(query)?.forEach((listener) => listener(event));
}

function notifyAll() {
  [...listeners.keys()].forEach(notify);
}

function install() {
  const matchMedia = (query: string): MediaQueryList => {
    const register = (listener: Listener) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(listener);
    };
    const unregister = (listener: Listener) => {
      listeners.get(query)?.delete(listener);
    };

    return {
      get matches() {
        return evaluate(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => register(listener),
      removeEventListener: (_type: string, listener: Listener) => unregister(listener),
      // Deprecated API, still used by some libraries.
      addListener: register,
      removeListener: unregister,
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  };

  vi.stubGlobal("matchMedia", matchMedia);
  window.matchMedia = matchMedia;
}

/** Called from setup before each test: fresh listeners, light OS preference. */
export function resetMatchMedia() {
  listeners.clear();
  prefersDark = false;
  install();
}

/** Flip the OS colour-scheme preference and fire change events. */
export function setPrefersDark(next: boolean) {
  prefersDark = next;
  notifyAll();
}

/** True if any live subscriber is still registered for `query`. */
export function listenerCount(query: string): number {
  return listeners.get(query)?.size ?? 0;
}

/** Resize the fake viewport and fire matching change events. */
export function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true, writable: true });
  notifyAll();
}
