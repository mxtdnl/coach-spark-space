import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsMobile } from "@/hooks/use-mobile";
import { listenerCount, setViewportWidth } from "@/test/matchMedia";

const QUERY = "(max-width: 767px)";

describe("useIsMobile", () => {
  it.each([
    [320, true],
    [767, true],
    [768, false],
    [1440, false],
  ])("reports width %ipx as isMobile=%s", (width, expected) => {
    setViewportWidth(width);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(expected);
  });

  it("coerces its undefined initial state to false", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("updates when the viewport crosses the breakpoint", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => setViewportWidth(500));
    expect(result.current).toBe(true);

    act(() => setViewportWidth(900));
    expect(result.current).toBe(false);
  });

  it("removes its listener on unmount", () => {
    const { unmount } = renderHook(() => useIsMobile());
    expect(listenerCount(QUERY)).toBe(1);
    unmount();
    expect(listenerCount(QUERY)).toBe(0);
  });
});
