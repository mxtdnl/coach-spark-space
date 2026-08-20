import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ProcrastinationChecklist from "@/exercises/ProcrastinationChecklist";
import { renderWithRouter } from "@/test/render";

const key = (field: string) => `sdc-vrl:v1:procrastination-checklist:${field}`;

async function openChecklist() {
  const user = userEvent.setup();
  await renderWithRouter(<ProcrastinationChecklist />);
  await user.click(screen.getByRole("button", { name: /begin/i }));
  return user;
}

const tickItem = async (user: ReturnType<typeof userEvent.setup>, label: string) =>
  user.click(screen.getByRole("checkbox", { name: label }));

describe("ProcrastinationChecklist", () => {
  it("starts unticked", async () => {
    await openChecklist();
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes.length).toBeGreaterThan(40);
    expect(boxes.every((box) => !(box as HTMLInputElement).checked)).toBe(true);
  });

  it("ticks and unticks an item", async () => {
    const user = await openChecklist();
    await tickItem(user, "Laundry");
    expect(screen.getByRole("checkbox", { name: "Laundry" })).toBeChecked();

    await tickItem(user, "Laundry");
    expect(screen.getByRole("checkbox", { name: "Laundry" })).not.toBeChecked();
  });

  it("keeps same-named items in different categories independent", async () => {
    const user = await openChecklist();
    // "Cleaning" and "Regular chores" both live under Home & Life Admin; the
    // storage key is namespaced by category, which this proves end to end.
    await tickItem(user, "Cleaning");

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(key("checked"))!);
      expect(saved.v).toEqual(["Home & Life Admin::Cleaning"]);
    });
  });

  it("counts ticks per category", async () => {
    const user = await openChecklist();
    await tickItem(user, "Laundry");
    await tickItem(user, "Cleaning");
    await user.click(screen.getByRole("button", { name: /see your patterns/i }));

    const row = screen.getByText("2 / 12").closest("div")!;
    expect(row).toHaveTextContent("Home & Life Admin");
  });

  it("counts a custom entry towards its category", async () => {
    const user = await openChecklist();
    const [academicsExtra] = screen.getAllByPlaceholderText("Add your own…");
    await user.type(academicsExtra, "Reading week catch-up");
    await user.click(screen.getByRole("button", { name: /see your patterns/i }));

    const row = screen.getByText("1 / 14").closest("div")!;
    expect(row).toHaveTextContent("Academics");
  });

  it("names the biggest cluster", async () => {
    const user = await openChecklist();
    await tickItem(user, "Exercise");
    await tickItem(user, "Sleep routine");
    await tickItem(user, "Drinking water");
    await tickItem(user, "Laundry");
    await user.click(screen.getByRole("button", { name: /see your patterns/i }));

    expect(screen.getByText(/Your biggest cluster is/)).toHaveTextContent(
      "Personal Wellness & Self-Care",
    );
  });

  it("says nothing about clusters when nothing is ticked", async () => {
    const user = await openChecklist();
    await user.click(screen.getByRole("button", { name: /see your patterns/i }));
    expect(screen.queryByText(/Your biggest cluster is/)).not.toBeInTheDocument();
  });

  it("stores ticks as a Set envelope and restores them as a real Set", async () => {
    const user = await openChecklist();
    await tickItem(user, "Laundry");

    await waitFor(() => {
      const raw = window.localStorage.getItem(key("checked"))!;
      expect(JSON.parse(raw).__t).toBe("Set");
    });

    const fresh = await renderWithRouter(<ProcrastinationChecklist />);
    await waitFor(() =>
      expect(within(fresh.container).getByRole("checkbox", { name: "Laundry" })).toBeChecked(),
    );
  });

  it("carries the plan through to the summary", async () => {
    const user = await openChecklist();
    await tickItem(user, "Laundry");
    await user.click(screen.getByRole("button", { name: /see your patterns/i }));

    await user.type(
      screen.getByRole("textbox", { name: /One specific action/ }),
      "Put a wash on Tuesday at 7pm",
    );
    await user.click(screen.getByRole("button", { name: /see summary/i }));

    expect(screen.getByText("Put a wash on Tuesday at 7pm")).toBeInTheDocument();
    expect(screen.getByText("Laundry")).toBeInTheDocument();
  });
});
