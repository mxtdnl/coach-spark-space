# Testing

Every feature in this repository is covered by an automated suite that runs on
every build. This document explains how to run it, how it is organised, and what
you need to do when you add an exercise.

## Running the tests

```bash
npm install          # first time only
npm test             # run everything once
npm run test:watch   # re-run affected tests as you edit
npm run test:coverage
npm run typecheck    # tsc --noEmit
npm run verify       # typecheck + tests, i.e. what CI gates on
```

The suite is [Vitest](https://vitest.dev) + [Testing
Library](https://testing-library.com) running in jsdom. It is configured in
`vitest.config.ts`, deliberately separate from `vite.config.ts`: the Lovable
preset pulls in TanStack Start, nitro and the router codegen plugin, none of
which can run inside a unit-test process. Tests need JSX and the `@/` alias, and
that is all this config declares.

## Where the tests live

| Area | File | What it pins down |
| --- | --- | --- |
| Exercise registry | `src/lib/__tests__/exercises.test.ts` | Every exercise has a unique, URL-safe slug, a real title/description, a category, tags, a sane duration and a component. Also checks that every module in `src/exercises/` is registered. |
| Autosave | `src/lib/__tests__/exercise-storage.test.tsx` | Key namespacing, `Set` round-tripping, corrupt entries, private-mode and quota failures, live "in progress" tracking, clear-one vs. clear-all. |
| Theme | `src/lib/__tests__/theme.test.tsx` | The pre-paint init script, the three-state toggle, following the OS live, and the theme surviving "clear all answers". |
| Utilities | `src/lib/__tests__/utils.test.ts`, `src/hooks/use-mobile.test.tsx` | `cn` class merging, the mobile breakpoint and its listener cleanup. |
| Error handling | `src/lib/__tests__/error-capture.test.ts`, `error-page.test.ts`, `src/__tests__/server.test.ts`, `src/__tests__/start.test.ts` | The out-of-band error capture and its TTL, the standalone error page, the h3-swallowed-500 recovery in the SSR entry, and the request middleware. |
| Server config | `src/lib/__tests__/config.server.test.ts`, `src/lib/api/__tests__/example.functions.test.ts` | Per-request env reads; the server function's call contract. |
| Shared UI | `src/exercises/__tests__/shared.test.tsx`, `src/components/__tests__/ThemeToggle.test.tsx` | The exercise UI kit (`InfoCard`, `IntroGrid`, buttons, `Field`, inputs) and the theme control. |
| Routes | `src/routes/__tests__/` | The library home (search, category filters, in-progress badges, clear-all confirmation), the exercise page (loader, metadata, not-found, per-exercise clear), and the root layout (head tags, SSR shell, 404 and error components). |
| **Every exercise** | `src/exercises/__tests__/all-exercises.test.tsx` | The contract below, applied to all 38 exercises. |
| Deep exercise behaviour | `src/exercises/__tests__/PrioritizationMatrix.test.tsx`, `WheelOfHult.test.tsx`, `BoxBreathing.test.tsx`, `ProcrastinationChecklist.test.tsx` | The exercises with real logic: pairwise ranking, the 35-point budget, the guided breathing timer, and `Set`-backed checklists. |

Helpers live in `src/test/`:

- `setup.ts` — global environment: jsdom gaps (`ResizeObserver`, pointer
  capture, `scrollTo`, `print`), and a clean device before every test.
- `matchMedia.ts` — a controllable `matchMedia`, so "the OS switched to dark
  mode" and "the viewport got narrower" are things a test can just do.
- `render.tsx` — `renderWithRouter` (a unit under test inside a small in-memory
  router) and `renderApp` (the real generated route tree, mounted in memory).
- `exercise-driver.tsx` — drives an arbitrary exercise generically: fills its
  fields, ticks its boxes, presses its non-destructive buttons.
- `route-options.ts` — typed accessors for route `head`/`loader` callbacks.

## The contract every exercise must satisfy

`all-exercises.test.tsx` iterates over `EXERCISES`, so **a new exercise is
covered the moment it is registered in `src/lib/exercises.ts`** — there is no
per-exercise test file to remember. Each one must:

1. render without crashing and show real content;
2. give every button an accessible name;
3. label every text field;
4. stay silent on `console.error`/`console.warn` while being worked through;
5. save only under its own `sdc-vrl:v1:<slug>:` namespace — no exercise can
   write into another's answers;
6. save nothing when it is merely opened and read;
7. restore the student's answers after a remount;
8. return to its defaults once its answers are cleared;
9. unmount cleanly, leaving no timer writing to a dead component.

If a new exercise fails one of these, the failure is in the exercise, not in the
suite. Add a dedicated test file next to the others when an exercise has logic
worth pinning down beyond the contract (scoring, budgets, timers).

## CI

`.github/workflows/ci.yml` runs typecheck → tests → production build on every
push and pull request, and uploads a JUnit report. The Pages deploy
(`deploy-pages.yml`) calls it first and publishes nothing unless it passes.

Lint runs as a separate advisory job: the existing source predates Prettier
enforcement and reports ~900 formatting errors, so it reports rather than
blocks. Run `npm run format` over the repository and drop `continue-on-error`
from that job to make it binding.
