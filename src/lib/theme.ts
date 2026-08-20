import { useCallback, useEffect, useState } from "react";

// Theme handling.
//
// The design tokens in styles.css already define a full dark palette under
// `.dark`; this decides when that class is on <html>.
//
// Three states: "light", "dark", and "system" (follow the OS). The choice is
// stored under a key OUTSIDE the sdc-vrl:v1: exercise namespace so clearing
// saved answers never resets someone's theme.

export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "sdc-vrl:theme";

/**
 * Runs before first paint, inlined into the document head, so the correct
 * palette is applied without a flash of the wrong theme. Kept dependency-free
 * and defensive: any failure leaves the default light theme in place.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    var dark = stored === "dark" ||
      ((!stored || stored === "system") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`.trim();

const prefersDark = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

function read(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Storage unavailable — fall through to the system preference.
  }
  return "system";
}

export function useTheme() {
  // Always "system" on the first render so server-rendered and client markup
  // match; the stored choice is picked up in the mount effect below.
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(read());
    setMounted(true);
  }, []);

  // Follow the OS live while the user is on "system".
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    apply(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Not persisting the choice is survivable; the page still switches.
    }
  }, []);

  return { theme, setTheme, mounted };
}
