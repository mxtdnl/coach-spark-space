import { act, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { THEME_INIT_SCRIPT, THEME_KEY, useTheme, type Theme } from "@/lib/theme";
import { listenerCount, setPrefersDark } from "@/test/matchMedia";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const isDark = () => document.documentElement.classList.contains("dark");

const originalStorage = Object.getOwnPropertyDescriptor(window, "localStorage")!;
afterEach(() => {
  Object.defineProperty(window, "localStorage", originalStorage);
});

/** Run THEME_INIT_SCRIPT the way the document head does. */
function runInitScript() {
  new Function(THEME_INIT_SCRIPT)();
}

describe("THEME_INIT_SCRIPT", () => {
  it("reads the theme key and toggles the dark class", () => {
    expect(THEME_INIT_SCRIPT).toContain(JSON.stringify(THEME_KEY));
    expect(THEME_INIT_SCRIPT).toContain("documentElement.classList.toggle");
  });

  it("is wrapped in an IIFE so it leaks no globals", () => {
    expect(THEME_INIT_SCRIPT.startsWith("(function ()")).toBe(true);
  });

  it("applies a stored dark choice before paint", () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    runInitScript();
    expect(isDark()).toBe(true);
  });

  it("applies a stored light choice even when the OS prefers dark", () => {
    setPrefersDark(true);
    window.localStorage.setItem(THEME_KEY, "light");
    runInitScript();
    expect(isDark()).toBe(false);
  });

  it("follows the OS when nothing is stored", () => {
    setPrefersDark(true);
    runInitScript();
    expect(isDark()).toBe(true);

    document.documentElement.className = "";
    setPrefersDark(false);
    runInitScript();
    expect(isDark()).toBe(false);
  });

  it("follows the OS for an explicit 'system' choice", () => {
    setPrefersDark(true);
    window.localStorage.setItem(THEME_KEY, "system");
    runInitScript();
    expect(isDark()).toBe(true);
  });

  it("leaves the default light theme in place when storage throws", () => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem() {
          throw new Error("denied");
        },
      },
    });
    expect(() => runInitScript()).not.toThrow();
    expect(isDark()).toBe(false);
  });
});

describe("useTheme", () => {
  it("renders as 'system' and unmounted first, so SSR and client markup match", () => {
    window.localStorage.setItem(THEME_KEY, "dark");

    // The very first render is what the server produced; only a probe that
    // records during render can see it, since effects have run by the time
    // renderHook hands back a result.
    const renders: { theme: Theme; mounted: boolean }[] = [];
    function Probe() {
      const { theme, mounted } = useTheme();
      renders.push({ theme, mounted });
      return null;
    }
    render(<Probe />);

    expect(renders[0]).toEqual({ theme: "system", mounted: false });
    expect(renders.at(-1)).toEqual({ theme: "dark", mounted: true });
  });

  it("adopts the stored choice after mount", async () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
      expect(result.current.theme).toBe("dark");
    });
  });

  it("stays on 'system' when the stored value is not a known theme", async () => {
    window.localStorage.setItem(THEME_KEY, "neon");
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));
    expect(result.current.theme).toBe("system");
  });

  it("stays on 'system' when storage is unreadable", async () => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem() {
          throw new Error("denied");
        },
        setItem() {
          throw new Error("denied");
        },
      },
    });

    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));
    expect(result.current.theme).toBe("system");
    expect(() => act(() => result.current.setTheme("dark"))).not.toThrow();
    expect(isDark()).toBe(true);
  });

  it.each<[Theme, boolean]>([
    ["dark", true],
    ["light", false],
  ])("setTheme(%s) applies the class and persists the choice", async (theme, expectedDark) => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.setTheme(theme));

    expect(result.current.theme).toBe(theme);
    expect(isDark()).toBe(expectedDark);
    expect(window.localStorage.getItem(THEME_KEY)).toBe(theme);
  });

  it("setTheme('system') resolves against the OS preference", async () => {
    setPrefersDark(true);
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.setTheme("light"));
    expect(isDark()).toBe(false);

    act(() => result.current.setTheme("system"));
    expect(isDark()).toBe(true);
    expect(window.localStorage.getItem(THEME_KEY)).toBe("system");
  });

  it("follows the OS live while on 'system'", async () => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));
    expect(result.current.theme).toBe("system");

    act(() => setPrefersDark(true));
    expect(isDark()).toBe(true);

    act(() => setPrefersDark(false));
    expect(isDark()).toBe(false);
  });

  it("ignores OS changes once an explicit choice is made", async () => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.setTheme("light"));
    act(() => setPrefersDark(true));

    expect(isDark()).toBe(false);
    expect(result.current.theme).toBe("light");
  });

  it("drops its OS listener when it leaves 'system' and on unmount", async () => {
    const { result, unmount } = renderHook(() => useTheme());
    await waitFor(() => expect(listenerCount(DARK_QUERY)).toBe(1));

    act(() => result.current.setTheme("dark"));
    await waitFor(() => expect(listenerCount(DARK_QUERY)).toBe(0));

    act(() => result.current.setTheme("system"));
    await waitFor(() => expect(listenerCount(DARK_QUERY)).toBe(1));

    unmount();
    expect(listenerCount(DARK_QUERY)).toBe(0);
  });

  it("keeps a stable setTheme identity across renders", async () => {
    const { result, rerender } = renderHook(() => useTheme());
    const first = result.current.setTheme;
    rerender();
    expect(result.current.setTheme).toBe(first);
  });

  it("stores the theme outside the exercise namespace", async () => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));
    act(() => result.current.setTheme("dark"));
    expect(THEME_KEY.startsWith("sdc-vrl:v1:")).toBe(false);
  });
});
