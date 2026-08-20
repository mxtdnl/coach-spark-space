import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { isValidElement, type ComponentType, type ReactElement, type ReactNode } from "react";

type ErrorProps = { error: Error; reset: () => void };
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Route } from "@/routes/__root";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { renderApp, renderWithRouter, rootShellComponent } from "@/test/render";
import { routeHead } from "@/test/route-options";

const head = routeHead(Route.options.head);

describe("root route head", () => {
  it("declares charset and a responsive viewport", () => {
    expect(head.meta).toEqual(
      expect.arrayContaining([
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ]),
    );
  });

  it("provides default title and description for routes that set none", () => {
    expect(head.meta).toEqual(expect.arrayContaining([{ title: "Coaching Exercise Library" }]));
    expect(head.meta!.find((m) => m.name === "description")?.content).toMatch(
      /coaching worksheets/i,
    );
  });

  it("provides Open Graph and Twitter card metadata", () => {
    const byKey = (key: string, value: string) =>
      head.meta!.find((m) => m.property === value || m.name === value);
    for (const value of [
      "og:title",
      "og:description",
      "og:type",
      "twitter:card",
      "twitter:title",
      "twitter:description",
    ]) {
      expect(byKey("meta", value)).toBeTruthy();
    }
  });

  it("links the application stylesheet", () => {
    expect(head.links).toEqual([expect.objectContaining({ rel: "stylesheet" })]);
  });
});

describe("root shell", () => {
  // The shell renders the <html> document itself and includes <HeadContent>,
  // which needs a live router — so it is inspected as an element tree rather
  // than rendered. What matters here is its structure, not its pixels.
  let tree: ReactElement;
  let nodes: ReactElement[];

  beforeAll(async () => {
    const shell = (await rootShellComponent()) as (props: { children: ReactNode }) => ReactElement;
    tree = shell({ children: <div id="app" /> });
    nodes = flatten(tree);
  });

  function flatten(node: ReactNode): ReactElement[] {
    if (Array.isArray(node)) return node.flatMap(flatten);
    if (!isValidElement(node)) return [];
    const children = (node.props as { children?: ReactNode }).children;
    return [node, ...flatten(children)];
  }

  it("renders a language-tagged html document", () => {
    expect(tree.type).toBe("html");
    expect((tree.props as { lang?: string }).lang).toBe("en");
  });

  it("renders the app inside the body", () => {
    const body = nodes.find((n) => n.type === "body")!;
    expect(flatten(body).some((n) => (n.props as { id?: string }).id === "app")).toBe(true);
  });

  it("inlines the theme script in the head so there is no flash of the wrong palette", () => {
    const script = nodes.find(
      (n) => n.type === "script" && "dangerouslySetInnerHTML" in (n.props as object),
    )!;
    expect(
      (script.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML
        .__html,
    ).toBe(THEME_INIT_SCRIPT);
    expect((script.props as { defer?: boolean; async?: boolean }).defer).toBeUndefined();
    expect((script.props as { defer?: boolean; async?: boolean }).async).toBeUndefined();
  });

  it("emits route head tags and the client scripts", () => {
    const names = nodes.map((n) => (typeof n.type === "function" ? n.type.name : n.type));
    expect(names).toContain("HeadContent");
    expect(names).toContain("Scripts");
  });
});

describe("root not-found component", () => {
  it("shows a 404 with a way home", async () => {
    const NotFound = Route.options.notFoundComponent as ComponentType;
    const app = await renderWithRouter(<NotFound />);

    expect(screen.getByRole("heading", { name: "404", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("link", { name: /go home/i }));
    await waitFor(() => expect(app.currentPath()).toBe("/"));
  });

  it("catches an unrouted URL", async () => {
    await renderApp("/no/such/page");
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
  });
});

describe("root error component", () => {
  it("explains the failure and offers a retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const reset = vi.fn();
    const ErrorComponent = Route.options.errorComponent as ComponentType<ErrorProps>;
    await renderWithRouter(<ErrorComponent error={new Error("kaboom")} reset={reset} />);

    expect(screen.getByRole("heading", { name: /this page didn't load/i })).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("logs the error for diagnosis", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("kaboom");
    const ErrorComponent = Route.options.errorComponent as ComponentType<ErrorProps>;
    await renderWithRouter(<ErrorComponent error={error} reset={() => {}} />);

    expect(logged).toHaveBeenCalledWith(error);
  });
});
