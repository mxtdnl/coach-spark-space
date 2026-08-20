// Shared machinery for the "every exercise" contract suite.
//
// The library's value is 38 self-contained exercises, and hand-writing a
// bespoke suite for each would rot the moment someone adds the 39th. Instead
// these helpers drive an arbitrary exercise generically — fill its fields,
// press its buttons — so one set of assertions applies to every exercise that
// is registered now or later.
import { fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";

export const STORAGE_PREFIX = "sdc-vrl:v1:";

/** Every sdc-vrl exercise key currently in localStorage. */
export function exerciseKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  return keys;
}

/** The slug portion of an exercise storage key. */
export const slugOfKey = (key: string) => key.slice(STORAGE_PREFIX.length).split(":")[0];

/**
 * Records anything written to console.error/console.warn while `fn` runs.
 * React reports render crashes, invalid props, key warnings and
 * controlled/uncontrolled switches through these, so an exercise that stays
 * quiet is an exercise that rendered cleanly.
 */
export async function withConsoleWatch<T>(
  fn: () => Promise<T> | T,
): Promise<{ result: T; messages: string[] }> {
  const messages: string[] = [];
  const record = (...args: unknown[]) => {
    messages.push(args.map((a) => (a instanceof Error ? a.message : String(a))).join(" "));
  };
  const error = vi.spyOn(console, "error").mockImplementation(record);
  const warn = vi.spyOn(console, "warn").mockImplementation(record);
  try {
    const result = await fn();
    return { result, messages };
  } finally {
    error.mockRestore();
    warn.mockRestore();
  }
}

const DESTRUCTIVE = /clear|reset|delete|remove|start over|start again|discard|print|download/i;

/** Accessible name of an element, as a screen reader would compute it (roughly). */
export function accessibleName(el: HTMLElement): string {
  const aria = el.getAttribute("aria-label");
  if (aria?.trim()) return aria.trim();
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }
  const title = el.getAttribute("title");
  if (title?.trim()) return title.trim();
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

type Interaction = { filled: number; clicked: number; names: string[] };

/**
 * Put an exercise through its paces: type into its text fields, tick its
 * checkboxes and radios, nudge its sliders, then press its non-destructive
 * buttons (which is how multi-step exercises advance). Bounded so a single
 * exercise can't dominate the suite.
 */
export function exercise(container: HTMLElement, marker = "test answer"): Interaction {
  const scope = within(container);
  const names: string[] = [];
  let filled = 0;

  const textFields = [
    ...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "textarea, input:not([type]), input[type=text], input[type=search], input[type=number], input[type=date]",
    ),
  ].slice(0, 8);

  for (const field of textFields) {
    if (field.disabled || field.readOnly) continue;
    const value =
      field instanceof HTMLInputElement && field.type === "number"
        ? "3"
        : field instanceof HTMLInputElement && field.type === "date"
          ? "2030-01-01"
          : `${marker} ${filled + 1}`;
    fireEvent.change(field, { target: { value } });
    filled++;
  }

  for (const box of [
    ...container.querySelectorAll<HTMLInputElement>("input[type=checkbox], input[type=radio]"),
  ].slice(0, 6)) {
    if (!box.disabled) fireEvent.click(box);
  }

  for (const range of [...container.querySelectorAll<HTMLInputElement>("input[type=range]")].slice(
    0,
    6,
  )) {
    if (!range.disabled) fireEvent.change(range, { target: { value: range.max || "7" } });
  }

  for (const select of [...container.querySelectorAll<HTMLSelectElement>("select")].slice(0, 4)) {
    const option = select.querySelector("option:not([disabled])");
    if (option && !select.disabled)
      fireEvent.change(select, { target: { value: (option as HTMLOptionElement).value } });
  }

  let clicked = 0;
  for (const button of scope.queryAllByRole("button")) {
    if (clicked >= 10) break;
    const name = accessibleName(button);
    if (!name || DESTRUCTIVE.test(name)) continue;
    if ((button as HTMLButtonElement).disabled) continue;
    fireEvent.click(button);
    names.push(name);
    clicked++;
  }

  return { filled, clicked, names };
}
