import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import WheelOfHult from "@/exercises/WheelOfHult";
import { renderWithRouter } from "@/test/render";

const SLUG = "wheel-of-hult";
const BUDGET = 35;
const MAX_PER_AREA = 10;
const key = (field: string) => `sdc-vrl:v1:${SLUG}:${field}`;

const AREAS = [
  "Campus Engagement",
  "Academic Performance",
  "Career Progression",
  "Social Life",
  "Skills Development",
  "Health",
  "Personal Development",
  "Other",
];

/** The numeric spinner for one area on the current step. */
const spinner = (name: string) => screen.getByRole("spinbutton", { name });

async function goToAllocate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /^Start →$/ }));
  await user.click(screen.getByRole("button", { name: /spend your points/i }));
}

async function spend(user: ReturnType<typeof userEvent.setup>, area: string, points: number) {
  const field = spinner(area);
  await user.clear(field);
  await user.type(field, String(points));
}

describe("WheelOfHult", () => {
  it("explains the budget on the intro step", async () => {
    await renderWithRouter(<WheelOfHult />);
    expect(screen.getByText(/Spend 35 resource points/)).toBeInTheDocument();
    expect(screen.getByText(/10 max in any one area/)).toBeInTheDocument();
  });

  it("rates all eight areas, starting at the midpoint", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await user.click(screen.getByRole("button", { name: /^Start →$/ }));

    for (const area of AREAS) {
      expect(spinner(area)).toHaveValue(5);
    }
  });

  it("starts the allocation wheel empty, with the whole budget unspent", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    expect(screen.getByText(`0 of ${BUDGET} points spent`)).toBeInTheDocument();
    expect(screen.getByText(`${BUDGET} left`)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /resource points spent/i })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("tracks spending against the budget", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    await spend(user, "Health", 6);
    await waitFor(() =>
      expect(screen.getByText(`6 of ${BUDGET} points spent`)).toBeInTheDocument(),
    );
    expect(screen.getByText("29 left")).toBeInTheDocument();

    await spend(user, "Social Life", 4);
    await waitFor(() =>
      expect(screen.getByText(`10 of ${BUDGET} points spent`)).toBeInTheDocument(),
    );
  });

  it("caps any single area at 10 points", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    await spend(user, "Health", 25);
    await waitFor(() => expect(spinner("Health")).toHaveValue(MAX_PER_AREA));
    expect(screen.getByRole("button", { name: "Increase Health" })).toBeDisabled();
  });

  it("never lets the total exceed the budget", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    for (const area of AREAS) await spend(user, area, MAX_PER_AREA);

    await waitFor(() =>
      expect(screen.getByText(`${BUDGET} of ${BUDGET} points spent`)).toBeInTheDocument(),
    );
    const total = AREAS.reduce(
      (sum, area) => sum + Number((spinner(area) as HTMLInputElement).value),
      0,
    );
    expect(total).toBe(BUDGET);
    expect(screen.getByText("0 left")).toBeInTheDocument();
  });

  it("marks areas that can take no more once the pot is empty", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    await spend(user, "Health", MAX_PER_AREA);
    await spend(user, "Social Life", MAX_PER_AREA);
    await spend(user, "Academic Performance", MAX_PER_AREA);
    await spend(user, "Career Progression", 5);

    await waitFor(() => expect(screen.getByText("0 left")).toBeInTheDocument());
    expect(screen.getAllByText("No points left").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Increase Campus Engagement" })).toBeDisabled();
  });

  it("frees the budget again when points are taken back", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    await spend(user, "Health", MAX_PER_AREA);
    await waitFor(() => expect(screen.getByText("25 left")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Decrease Health" }));
    await waitFor(() => expect(screen.getByText("26 left")).toBeInTheDocument());
    expect(spinner("Health")).toHaveValue(9);
  });

  it("refuses negative points", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    expect(screen.getByRole("button", { name: "Decrease Health" })).toBeDisabled();
    await spend(user, "Health", 0);
    await waitFor(() => expect(spinner("Health")).toHaveValue(0));
    expect(screen.getByText(`0 of ${BUDGET} points spent`)).toBeInTheDocument();
  });

  it("nudges the student while points are unspent", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    await spend(user, "Health", 1);
    await waitFor(() =>
      expect(screen.getByText(/You still have 34 points unspent/)).toBeInTheDocument(),
    );
  });

  it("blocks the comparison step until something is allocated", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);

    const next = screen.getByRole("button", { name: /compare the wheels/i });
    expect(next).toBeDisabled();

    await spend(user, "Health", 3);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /compare the wheels/i })).toBeEnabled(),
    );
  });

  it("renames the 'Other' area everywhere", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await user.click(screen.getByRole("button", { name: /^Start →$/ }));

    await user.type(
      screen.getByPlaceholderText(/Family, Faith, Side business/),
      "Caring for my sister",
    );
    await waitFor(() =>
      expect(screen.getByRole("spinbutton", { name: "Caring for my sister" })).toBeInTheDocument(),
    );
    expect(screen.queryByRole("spinbutton", { name: "Other" })).not.toBeInTheDocument();
  });

  it("keeps saving renamed areas under their fixed keys", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await user.click(screen.getByRole("button", { name: /^Start →$/ }));
    await user.type(screen.getByPlaceholderText(/Family, Faith, Side business/), "Faith");
    await user.click(screen.getByRole("button", { name: "Increase Faith" }));

    await waitFor(() => {
      const scores = JSON.parse(window.localStorage.getItem(key("scores"))!);
      expect(scores.Other).toBe(6);
    });
  });

  it("persists the step and the allocation across a remount", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<WheelOfHult />);
    await goToAllocate(user);
    await spend(user, "Health", 7);

    await waitFor(() => {
      expect(window.localStorage.getItem(key("step"))).toBe('"allocate"');
      expect(JSON.parse(window.localStorage.getItem(key("points"))!).Health).toBe(7);
    });

    const fresh = await renderWithRouter(<WheelOfHult />);
    await waitFor(() =>
      expect(within(fresh.container).getByText(`7 of ${BUDGET} points spent`)).toBeInTheDocument(),
    );
  });
});
