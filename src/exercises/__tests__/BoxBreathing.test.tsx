import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BoxBreathing from "@/exercises/BoxBreathing";
import { renderWithRouter } from "@/test/render";

const key = (field: string) => `sdc-vrl:v1:box-breathing:${field}`;

/** Advance the guided timer by whole seconds. */
async function tick(seconds: number) {
  await act(async () => {
    vi.advanceTimersByTime(seconds * 1000);
  });
}

const start = () => fireEvent.click(screen.getByRole("button", { name: /start/i }));

describe("BoxBreathing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits to be started, showing no countdown", async () => {
    await renderWithRouter(<BoxBreathing />);
    expect(screen.getByText("Press start")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("defaults to 4 seconds a phase and 4 cycles", async () => {
    await renderWithRouter(<BoxBreathing />);
    const [seconds, cycles] = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(seconds.value).toBe("4");
    expect(cycles.value).toBe("4");
  });

  it("counts down the first phase second by second", async () => {
    await renderWithRouter(<BoxBreathing />);
    await act(async () => start());

    expect(screen.getByText("Inhale")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    await tick(1);
    expect(screen.getByText("3")).toBeInTheDocument();
    await tick(1);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("walks the four phases in order", async () => {
    await renderWithRouter(<BoxBreathing />);
    await act(async () => start());

    expect(screen.getByText("Inhale")).toBeInTheDocument();
    expect(screen.getByText(/Breathe in slowly/)).toBeInTheDocument();

    await tick(4);
    expect(screen.getByText(/Hold your breath, stay relaxed/)).toBeInTheDocument();

    await tick(4);
    expect(screen.getByText("Exhale")).toBeInTheDocument();

    await tick(4);
    expect(screen.getByText(/Hold your breath, stay calm/)).toBeInTheDocument();
  });

  it("moves to the next cycle after four phases", async () => {
    await renderWithRouter(<BoxBreathing />);
    await act(async () => start());
    expect(screen.getByText("Cycle 1 of 4")).toBeInTheDocument();

    await tick(16);
    expect(screen.getByText("Cycle 2 of 4")).toBeInTheDocument();
  });

  it("stops itself once every cycle is done", async () => {
    await renderWithRouter(<BoxBreathing />);
    await act(async () => start());

    // 4 cycles x 4 phases x 4 seconds.
    await tick(64);
    expect(screen.getByText("Press start")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("stopping resets the session back to the beginning", async () => {
    await renderWithRouter(<BoxBreathing />);
    await act(async () => start());
    await tick(6);

    await act(async () => fireEvent.click(screen.getByRole("button", { name: /stop/i })));
    expect(screen.getByText("Press start")).toBeInTheDocument();

    await act(async () => start());
    expect(screen.getByText("Cycle 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Inhale")).toBeInTheDocument();
  });

  it("honours a changed phase length", async () => {
    await renderWithRouter(<BoxBreathing />);
    const [seconds] = screen.getAllByRole("combobox");
    await act(async () => fireEvent.change(seconds, { target: { value: "6" } }));

    await act(async () => start());
    expect(screen.getByText("6")).toBeInTheDocument();

    await tick(6);
    expect(screen.getByText(/Hold your breath, stay relaxed/)).toBeInTheDocument();
  });

  it("honours a changed cycle count", async () => {
    await renderWithRouter(<BoxBreathing />);
    const [, cycles] = screen.getAllByRole("combobox");
    await act(async () => fireEvent.change(cycles, { target: { value: "2" } }));

    await act(async () => start());
    expect(screen.getByText("Cycle 1 of 2")).toBeInTheDocument();

    await tick(32);
    expect(screen.getByText("Press start")).toBeInTheDocument();
  });

  it("saves the session settings, but not the live timer state", async () => {
    await renderWithRouter(<BoxBreathing />);
    const [seconds, cycles] = screen.getAllByRole("combobox");
    await act(async () => fireEvent.change(seconds, { target: { value: "7" } }));
    await act(async () => fireEvent.change(cycles, { target: { value: "8" } }));

    // Effects have flushed inside act(), so the writes are already on disk —
    // waitFor would stall here because the clock is faked.
    expect(window.localStorage.getItem(key("secondsPerPhase"))).toBe("7");
    expect(window.localStorage.getItem(key("totalCycles"))).toBe("8");

    await act(async () => start());
    await tick(3);
    expect(window.localStorage.getItem(key("tick"))).toBeNull();
    expect(window.localStorage.getItem(key("running"))).toBeNull();
  });

  it("clears its interval on unmount", async () => {
    const clearInterval = vi.spyOn(window, "clearInterval");
    const { unmount } = await renderWithRouter(<BoxBreathing />);
    await act(async () => start());
    await tick(2);

    unmount();
    expect(clearInterval).toHaveBeenCalled();

    // Nothing left running that could keep ticking.
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });
  });
});
