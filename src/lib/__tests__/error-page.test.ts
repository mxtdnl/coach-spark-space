import { describe, expect, it } from "vitest";
import { renderErrorPage } from "@/lib/error-page";

describe("renderErrorPage", () => {
  const html = renderErrorPage();

  it("returns a complete, self-contained HTML document", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("</html>");
    expect(html).toContain('<meta charset="utf-8" />');
    expect(html).toContain('name="viewport"');
  });

  it("references no external asset, so it renders when the app bundle is broken", () => {
    expect(html).not.toMatch(/<script\s+src=/);
    expect(html).not.toMatch(/<link[^>]+stylesheet/);
    expect(html).not.toMatch(/https?:\/\//);
  });

  it("offers a retry and a way home", () => {
    expect(html).toContain("location.reload()");
    expect(html).toContain('href="/"');
  });

  it("is deterministic", () => {
    expect(renderErrorPage()).toBe(html);
  });
});
