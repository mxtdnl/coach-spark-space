import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Field,
  GhostButton,
  InfoCard,
  IntroGrid,
  PrimaryButton,
  TextArea,
  TextInput,
} from "@/exercises/_shared";

describe("InfoCard", () => {
  it("renders its title as a heading and shows its content", () => {
    render(<InfoCard title="What">Some explanation</InfoCard>);
    expect(screen.getByRole("heading", { name: "What" })).toBeInTheDocument();
    expect(screen.getByText("Some explanation")).toBeInTheDocument();
  });

  it("accepts rich children", () => {
    render(
      <InfoCard title="How">
        <ol>
          <li>Step one</li>
        </ol>
      </InfoCard>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Step one");
  });
});

describe("IntroGrid", () => {
  it("renders the What / Why / How trio in order", () => {
    render(<IntroGrid what="the what" why="the why" how="the how" />);
    const headings = screen.getAllByRole("heading").map((h) => h.textContent);
    expect(headings).toEqual(["What", "Why", "How"]);
    expect(screen.getByText("the what")).toBeInTheDocument();
    expect(screen.getByText("the why")).toBeInTheDocument();
    expect(screen.getByText("the how")).toBeInTheDocument();
  });
});

describe.each([
  ["PrimaryButton", PrimaryButton],
  ["GhostButton", GhostButton],
])("%s", (_name, Button) => {
  it("renders a button with its label", () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Continue</Button>);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Continue
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the caller's className alongside its own styles", () => {
    render(<Button className="mt-4">Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.className).toContain("mt-4");
    expect(button.className).toContain("rounded");
  });

  it("passes through arbitrary button attributes", () => {
    render(
      <Button type="submit" aria-label="Save answers">
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save answers" });
    expect(button).toHaveAttribute("type", "submit");
  });
});

describe("Field", () => {
  it("associates its label with the control inside it", () => {
    render(
      <Field label="Your goal">
        <TextArea />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: /Your goal/ })).toBeInTheDocument();
  });

  it("shows an optional hint", () => {
    render(
      <Field label="Your goal" hint="Keep it to one sentence.">
        <TextInput />
      </Field>,
    );
    expect(screen.getByText("Keep it to one sentence.")).toBeInTheDocument();
  });

  it("omits the hint when none is given", () => {
    const { container } = render(
      <Field label="Your goal">
        <TextInput />
      </Field>,
    );
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("focuses the control when its label is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Your goal">
        <TextInput />
      </Field>,
    );

    await user.click(screen.getByText("Your goal"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });
});

describe.each([
  ["TextArea", TextArea, "textarea"],
  ["TextInput", TextInput, "input"],
])("%s", (_name, Control, tag) => {
  it("renders the right element", () => {
    const { container } = render(<Control />);
    expect(container.querySelector(tag)).toBeInTheDocument();
  });

  it("is controllable", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Control value="" onChange={onChange} placeholder="Type here" />);

    await user.type(screen.getByPlaceholderText("Type here"), "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("keeps the caller's className", () => {
    const { container } = render(<Control className="mt-3" />);
    expect(container.querySelector(tag)!.className).toContain("mt-3");
    expect(container.querySelector(tag)!.className).toContain("rounded-md");
  });

  it("passes through attributes such as maxLength and disabled", () => {
    const { container } = render(<Control maxLength={28} disabled />);
    const control = container.querySelector(tag)!;
    expect(control).toHaveAttribute("maxlength", "28");
    expect(control).toBeDisabled();
  });
});
