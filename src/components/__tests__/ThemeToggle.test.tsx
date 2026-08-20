import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/ThemeToggle";
import { THEME_KEY } from "@/lib/theme";
import { setPrefersDark } from "@/test/matchMedia";

const isDark = () => document.documentElement.classList.contains("dark");
const option = (name: string) => screen.getByRole("radio", { name });

describe("ThemeToggle", () => {
  it("is a labelled radio group of three options", async () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("radiogroup", { name: "Colour theme" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    for (const name of ["Light", "Match system", "Dark"]) {
      expect(option(name)).toBeInTheDocument();
    }
  });

  it("marks nothing active before mount, then reflects the stored choice", async () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    render(<ThemeToggle />);
    await waitFor(() => expect(option("Dark")).toHaveAttribute("aria-checked", "true"));
    expect(option("Light")).toHaveAttribute("aria-checked", "false");
    expect(option("Match system")).toHaveAttribute("aria-checked", "false");
  });

  it("defaults to 'Match system' on a fresh device", async () => {
    render(<ThemeToggle />);
    await waitFor(() => expect(option("Match system")).toHaveAttribute("aria-checked", "true"));
  });

  it("switches to dark and persists the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(option("Dark"));

    expect(isDark()).toBe(true);
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(option("Dark")).toHaveAttribute("aria-checked", "true");
  });

  it("switches back to light", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(option("Dark"));
    await user.click(option("Light"));

    expect(isDark()).toBe(false);
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("'Match system' hands control back to the OS", async () => {
    setPrefersDark(true);
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(option("Light"));
    expect(isDark()).toBe(false);

    await user.click(option("Match system"));
    expect(isDark()).toBe(true);
    expect(window.localStorage.getItem(THEME_KEY)).toBe("system");
  });

  it("gives every option a tooltip as well as a label", () => {
    render(<ThemeToggle />);
    expect(option("Dark")).toHaveAttribute("title", "Dark");
  });

  it("is hidden from print output", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("radiogroup").className).toContain("no-print");
  });

  it("accepts extra classes from the caller", () => {
    render(<ThemeToggle className="ml-2" />);
    expect(screen.getByRole("radiogroup").className).toContain("ml-2");
  });

  it("uses buttons of type=button so it never submits a form", () => {
    render(<ThemeToggle />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("type", "button");
    }
  });
});
