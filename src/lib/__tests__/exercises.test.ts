import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { EXERCISES, getCategories, getExercise, type Exercise } from "@/lib/exercises";

const exercisesDir = path.resolve(process.cwd(), "src/exercises");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("the exercise registry", () => {
  it("is not empty", () => {
    expect(EXERCISES.length).toBeGreaterThan(0);
  });

  it("has unique slugs", () => {
    const slugs = EXERCISES.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique titles", () => {
    const titles = EXERCISES.map((e) => e.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("registers every component exactly once", () => {
    const components = EXERCISES.map((e) => e.component);
    expect(new Set(components).size).toBe(components.length);
  });

  it("registers every exercise module in src/exercises", () => {
    const modules = readdirSync(exercisesDir)
      .filter((f) => f.endsWith(".tsx") && !f.startsWith("_") && !f.includes(".test."))
      .map((f) => f.replace(/\.tsx$/, ""))
      .sort();

    // The registry imports each component by module name, so comparing counts
    // catches the usual mistake: adding an exercise file and forgetting to
    // list it (or deleting one and leaving a dangling entry).
    expect(EXERCISES).toHaveLength(modules.length);
  });
});

describe.each(EXERCISES.map((e) => [e.slug, e] as [string, Exercise]))(
  "exercise %s",
  (_slug, exercise) => {
    it("has a URL-safe, kebab-case slug", () => {
      expect(exercise.slug).toMatch(SLUG_PATTERN);
      expect(encodeURIComponent(exercise.slug)).toBe(exercise.slug);
    });

    it("has a title and a description that read as sentences", () => {
      expect(exercise.title.trim()).toBe(exercise.title);
      expect(exercise.title.length).toBeGreaterThan(2);
      expect(exercise.description.trim()).toBe(exercise.description);
      expect(exercise.description.length).toBeGreaterThan(20);
    });

    it("belongs to a non-empty category", () => {
      expect(exercise.category.trim()).toBe(exercise.category);
      expect(exercise.category.length).toBeGreaterThan(0);
    });

    it("carries at least one tag, all lowercase, trimmed and unique", () => {
      expect(exercise.tags.length).toBeGreaterThan(0);
      for (const tag of exercise.tags) {
        expect(tag).toBe(tag.trim().toLowerCase());
        expect(tag.length).toBeGreaterThan(0);
      }
      expect(new Set(exercise.tags).size).toBe(exercise.tags.length);
    });

    it("estimates a plausible duration", () => {
      expect(Number.isInteger(exercise.estimatedMinutes)).toBe(true);
      expect(exercise.estimatedMinutes).toBeGreaterThan(0);
      expect(exercise.estimatedMinutes).toBeLessThanOrEqual(120);
    });

    it("points at a renderable component", () => {
      expect(typeof exercise.component).toBe("function");
    });
  },
);

describe("getExercise", () => {
  it("finds every registered slug", () => {
    for (const exercise of EXERCISES) {
      expect(getExercise(exercise.slug)).toBe(exercise);
    }
  });

  it("returns undefined for an unknown slug", () => {
    expect(getExercise("no-such-exercise")).toBeUndefined();
  });

  it("is case- and whitespace-sensitive (slugs come straight from the URL)", () => {
    const slug = EXERCISES[0].slug;
    expect(getExercise(slug.toUpperCase())).toBeUndefined();
    expect(getExercise(` ${slug} `)).toBeUndefined();
  });

  it("survives odd input", () => {
    expect(getExercise("")).toBeUndefined();
    expect(getExercise("../../etc/passwd")).toBeUndefined();
    expect(getExercise("constructor")).toBeUndefined();
    expect(getExercise("__proto__")).toBeUndefined();
  });
});

describe("getCategories", () => {
  const categories = getCategories();

  it("lists each category once", () => {
    expect(new Set(categories).size).toBe(categories.length);
  });

  it("is sorted alphabetically", () => {
    expect(categories).toEqual([...categories].sort());
  });

  it("covers exactly the categories in use", () => {
    expect(new Set(categories)).toEqual(new Set(EXERCISES.map((e) => e.category)));
  });

  it("returns a fresh array each call, so callers can't corrupt it", () => {
    const first = getCategories();
    first.push("Injected");
    expect(getCategories()).not.toContain("Injected");
  });
});
