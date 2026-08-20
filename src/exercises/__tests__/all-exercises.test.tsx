import { act, cleanup, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EXERCISES } from "@/lib/exercises";
import { clearExercise, hasSavedWork } from "@/lib/exercise-storage";
import { renderWithRouter } from "@/test/render";
import {
  accessibleName,
  exercise as driveExercise,
  exerciseKeys,
  slugOfKey,
  withConsoleWatch,
} from "@/test/exercise-driver";

/**
 * The contract every exercise in the library must satisfy, applied to all of
 * them. Adding a new exercise to src/lib/exercises.ts automatically adds it
 * here, so a new build always tests the whole library.
 */
describe.each(EXERCISES.map((e) => [e.title, e.slug] as const))("%s (%s)", (_title, slug) => {
  const Component = EXERCISES.find((e) => e.slug === slug)!.component;

  it("renders without crashing and shows real content", async () => {
    const { messages } = await withConsoleWatch(async () => {
      const { container } = await renderWithRouter(<Component />);
      await act(async () => {});
      expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(50);
    });
    expect(messages).toEqual([]);
  });

  it("gives every button an accessible name", async () => {
    const { container } = await renderWithRouter(<Component />);
    await act(async () => {});
    const unnamed = within(container)
      .queryAllByRole("button")
      .filter((button) => accessibleName(button) === "")
      .map((button) => button.outerHTML.slice(0, 120));
    expect(unnamed).toEqual([]);
  });

  it("labels every text field", async () => {
    const { container } = await renderWithRouter(<Component />);
    await act(async () => {});

    const unlabelled = [
      ...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea"),
    ]
      .filter((field) => {
        if (field instanceof HTMLInputElement && field.type === "hidden") return false;
        if (accessibleName(field)) return false;
        if (field.placeholder?.trim()) return false;
        if (field.id && container.querySelector(`label[for="${field.id}"]`)) return false;
        return !field.closest("label");
      })
      .map((field) => field.outerHTML.slice(0, 120));

    expect(unlabelled).toEqual([]);
  });

  it("stays quiet while the user works through it", async () => {
    const { messages } = await withConsoleWatch(async () => {
      const { container } = await renderWithRouter(<Component />);
      await act(async () => {});
      await act(async () => {
        driveExercise(container);
      });
    });
    expect(messages).toEqual([]);
  });

  it("saves only under its own slug namespace", async () => {
    const { container } = await renderWithRouter(<Component />);
    await act(async () => {});
    await act(async () => {
      driveExercise(container);
    });

    const foreign = exerciseKeys().filter((key) => slugOfKey(key) !== slug);
    expect(foreign).toEqual([]);
  });

  it("saves nothing when it is only opened and read", async () => {
    await renderWithRouter(<Component />);
    expect(exerciseKeys()).toEqual([]);
  });

  it("restores the user's answers after a remount", async () => {
    const { container, unmount } = await renderWithRouter(<Component />);
    await act(async () => {});
    await act(async () => {
      driveExercise(container, "remembered");
    });

    // Not every exercise has a persistable control on its first screen; those
    // that saved nothing have nothing to restore.
    if (!hasSavedWork(slug)) return;
    const saved = Object.fromEntries(
      exerciseKeys().map((k) => [k, window.localStorage.getItem(k)]),
    );

    unmount();
    await renderWithRouter(<Component />);
    await waitFor(() => {
      for (const [key, value] of Object.entries(saved)) {
        expect(window.localStorage.getItem(key)).toBe(value);
      }
    });
  });

  it("comes back at its defaults once its answers are cleared", async () => {
    const first = await renderWithRouter(<Component />);
    await act(async () => {});
    const pristine = first.container.innerHTML;

    await act(async () => {
      driveExercise(first.container);
    });
    if (!hasSavedWork(slug)) return;

    cleanup();
    clearExercise(slug);
    expect(hasSavedWork(slug)).toBe(false);

    const second = await renderWithRouter(<Component />);
    await act(async () => {});
    expect(second.container.innerHTML).toBe(pristine);
  });

  it("unmounts cleanly, leaving no timer writing to a dead component", async () => {
    const { messages } = await withConsoleWatch(async () => {
      const { container, unmount } = await renderWithRouter(<Component />);
      await act(async () => {});
      await act(async () => {
        driveExercise(container);
      });
      unmount();
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    });
    expect(messages).toEqual([]);
  });
});
