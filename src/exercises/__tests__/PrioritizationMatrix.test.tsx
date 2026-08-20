import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import PrioritizationMatrix from "@/exercises/PrioritizationMatrix";
import { renderWithRouter } from "@/test/render";

const SLUG = "prioritization-matrix";
const key = (field: string) => `sdc-vrl:v1:${SLUG}:${field}`;

async function startWithTasks(tasks: string[]) {
  const user = userEvent.setup();
  await renderWithRouter(<PrioritizationMatrix />);
  await user.click(screen.getByRole("button", { name: /start the exercise/i }));

  const fields = screen.getAllByPlaceholderText(/^Task \d+$/);
  for (const [i, task] of tasks.entries()) {
    await user.clear(fields[i]);
    await user.type(fields[i], task);
  }
  return user;
}

/**
 * Decide one cell of the comparison grid.
 *
 * Each row is a task; each cell in it compares that task ("row") against an
 * earlier one ("column"), offering a button per side.
 */
async function decide(
  user: ReturnType<typeof userEvent.setup>,
  rowTask: string,
  columnIndex: number,
  winner: "row" | "column",
) {
  const label = screen.getAllByText(rowTask).find((el) => el.closest("td"))!;
  const cells = within(label.closest("tr")!).getAllByRole("cell");
  const buttons = within(cells[1 + columnIndex]).getAllByRole("button");
  await user.click(buttons[winner === "row" ? 0 : 1]);
}

describe("PrioritizationMatrix", () => {
  it("opens on the intro step", async () => {
    await renderWithRouter(<PrioritizationMatrix />);
    expect(screen.getByRole("button", { name: /start the exercise/i })).toBeInTheDocument();
    expect(screen.getByText(/never more than a pair at once/i)).toBeInTheDocument();
  });

  it("starts with six empty task rows lettered A–F", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<PrioritizationMatrix />);
    await user.click(screen.getByRole("button", { name: /start the exercise/i }));

    expect(screen.getAllByPlaceholderText(/^Task \d+$/)).toHaveLength(6);
    for (const letter of ["A", "B", "C", "D", "E", "F"]) {
      expect(screen.getByText(letter)).toBeInTheDocument();
    }
  });

  it("blocks the compare step until at least two tasks are named", async () => {
    const user = await startWithTasks(["Only one"]);
    expect(screen.getByRole("button", { name: /compare 1 tasks/i })).toBeDisabled();

    const fields = screen.getAllByPlaceholderText(/^Task \d+$/);
    await user.type(fields[1], "Second");
    expect(screen.getByRole("button", { name: /compare 2 tasks/i })).toBeEnabled();
  });

  it("ignores whitespace-only tasks when counting", async () => {
    await startWithTasks(["Real task", "   ", "Another real task"]);
    expect(screen.getByRole("button", { name: /compare 2 tasks/i })).toBeInTheDocument();
  });

  it("caps the list at 12 tasks and keeps a floor of 2", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<PrioritizationMatrix />);
    await user.click(screen.getByRole("button", { name: /start the exercise/i }));

    const add = screen.getByRole("button", { name: /add task/i });
    for (let i = 0; i < 6; i++) await user.click(add);
    expect(screen.getAllByPlaceholderText(/^Task \d+$/)).toHaveLength(12);
    expect(add).toBeDisabled();

    const removals = screen.getAllByRole("button", { name: "Remove" });
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    }
    expect(screen.getAllByPlaceholderText(/^Task \d+$/)).toHaveLength(2);
    expect(removals[0]).toBeDisabled();
  });

  it("loads the ten example tasks", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<PrioritizationMatrix />);
    await user.click(screen.getByRole("button", { name: /start the exercise/i }));
    await user.click(screen.getByRole("button", { name: /load example/i }));

    expect(screen.getByDisplayValue("Reading for Thursday class")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compare 10 tasks/i })).toBeEnabled();
  });

  it("asks for one comparison per pair: n(n-1)/2", async () => {
    const user = await startWithTasks(["Alpha", "Beta", "Gamma", "Delta"]);
    await user.click(screen.getByRole("button", { name: /compare 4 tasks/i }));

    expect(screen.getByText("0 / 6 decided")).toBeInTheDocument();
  });

  it("counts decisions as they are made and unlocks the results step", async () => {
    const user = await startWithTasks(["Alpha", "Beta", "Gamma"]);
    await user.click(screen.getByRole("button", { name: /compare 3 tasks/i }));

    const results = screen.getByRole("button", { name: /see priorities/i });
    expect(results).toBeDisabled();

    await decide(user, "Beta", 0, "row");
    expect(screen.getByText("1 / 3 decided")).toBeInTheDocument();
    expect(results).toBeDisabled();

    await decide(user, "Gamma", 0, "row");
    await decide(user, "Gamma", 1, "row");
    await waitFor(() => expect(screen.getByText("3 / 3 decided")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /see priorities/i })).toBeEnabled();
  });

  it("re-picking the same pair replaces the earlier answer instead of adding one", async () => {
    const user = await startWithTasks(["Alpha", "Beta"]);
    await user.click(screen.getByRole("button", { name: /compare 2 tasks/i }));

    await decide(user, "Beta", 0, "row");
    await decide(user, "Beta", 0, "column");
    expect(screen.getByText("1 / 1 decided")).toBeInTheDocument();
  });

  it("ranks by wins, highest first", async () => {
    const user = await startWithTasks(["Alpha", "Beta", "Gamma"]);
    await user.click(screen.getByRole("button", { name: /compare 3 tasks/i }));

    // Beta beats Alpha; Gamma beats Alpha and Beta -> Gamma 2, Beta 1, Alpha 0.
    await decide(user, "Beta", 0, "row");
    await decide(user, "Gamma", 0, "row");
    await decide(user, "Gamma", 1, "row");
    await user.click(screen.getByRole("button", { name: /see priorities/i }));

    const ranked = screen.getAllByRole("listitem").map((li) => li.textContent ?? "");
    expect(ranked[0]).toContain("Gamma");
    expect(ranked[0]).toContain("2 wins");
    expect(ranked[1]).toContain("Beta");
    expect(ranked[1]).toContain("1 win");
    expect(ranked[2]).toContain("Alpha");
    expect(ranked[2]).toContain("0 wins");
  });

  it("says '1 win' but '0 wins' and '2 wins'", async () => {
    const user = await startWithTasks(["Alpha", "Beta"]);
    await user.click(screen.getByRole("button", { name: /compare 2 tasks/i }));
    await decide(user, "Beta", 0, "column");
    await user.click(screen.getByRole("button", { name: /see priorities/i }));

    expect(screen.getByText(/^1 win$/)).toBeInTheDocument();
    expect(screen.getByText(/^0 wins$/)).toBeInTheDocument();
  });

  it("shows a total-wins row in the matrix", async () => {
    const user = await startWithTasks(["Alpha", "Beta"]);
    await user.click(screen.getByRole("button", { name: /compare 2 tasks/i }));
    await decide(user, "Beta", 0, "column");

    const totals = screen.getByText("Total wins").closest("tr")!;
    expect(within(totals).getByText("1")).toBeInTheDocument();
  });

  it("restarting clears the answers and returns to the intro", async () => {
    const user = await startWithTasks(["Alpha", "Beta"]);
    await user.click(screen.getByRole("button", { name: /compare 2 tasks/i }));
    await decide(user, "Beta", 0, "column");
    await user.click(screen.getByRole("button", { name: /see priorities/i }));
    await user.click(screen.getByRole("button", { name: /start over/i }));

    expect(screen.getByRole("button", { name: /start the exercise/i })).toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.getItem(key("choices"))).toBe("{}"));
  });

  it("persists step, tasks and choices, and restores them on a fresh mount", async () => {
    const user = await startWithTasks(["Alpha", "Beta"]);
    await user.click(screen.getByRole("button", { name: /compare 2 tasks/i }));
    await decide(user, "Beta", 0, "column");

    await waitFor(() => {
      expect(window.localStorage.getItem(key("step"))).toBe('"compare"');
      expect(JSON.parse(window.localStorage.getItem(key("tasks"))!)).toContain("Alpha");
      // Alpha (index 0) won the only pair, "row 1 vs column 0".
      expect(JSON.parse(window.localStorage.getItem(key("choices"))!)).toEqual({ "1-0": 0 });
    });

    await act(async () => {});
    const fresh = await renderWithRouter(<PrioritizationMatrix />);
    await waitFor(() =>
      expect(within(fresh.container).getByText("1 / 1 decided")).toBeInTheDocument(),
    );
  });
});
