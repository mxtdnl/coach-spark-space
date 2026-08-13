# Three new library entries + next Brilliant-style redesigns

## Part 1 — New exercises from the uploads

### 1. Ethical Dilemmas (`/exercise/ethical-dilemmas`)
Category: Decision-Making. ~15 min.

Interactive card-deck flow rather than a static scenario list:
- Intro (What / Why / How) in the standard three-card grid.
- Pick a dilemma from six cards (Trolley Problem, Lifeboat, Friend's Secret, Inflated Results, Faulty Product, Unethical Supplier), split into Classical and Business tabs.
- Gut check: a two-option snap choice plus a short "why" box, captured before any analysis so the student can compare it to their final answer.
- Weigh it up: short-term vs long-term consequences for each option, a value-tag picker (fairness, honesty, loyalty, results, care, integrity...), and a stakeholder list where each stakeholder gets a "how would they see it?" line.
- Decide: final choice, reasoning, and a side-by-side "your gut said X / you chose Y" reveal.
- Summary with print/save.

### 2. BEAR Feedback Model (`/exercise/bear-feedback-model`)
Category: Communication (new category). ~12 min.

- Intro grid, then a worked example carousel (the two examples from the PDF) so students see the model before writing.
- Guided four-step builder: Behavior → Effect → Alternative → Result, one step at a time with the step's guidance and a live-assembling feedback script panel that fills in as they type.
- Light self-check prompts on the Behavior step (facts only, no judgement) as toggles the student ticks.
- Summary shows the full feedback message as one readable paragraph they can copy or print.

### 3. Team Alignment Session (`/exercise/team-alignment`)
Category: Teamwork (new category). ~45 min.

The source doc is a facilitator script, so it becomes a session companion a team fills in together:
- Intro explains the 45-minute structure and ground rules (solution-focused, respectful, everyone present).
- Session goal picker: the team chooses what today is for (alignment, strengths, goal setting, conflict, roles).
- Goals & expectations round: each question from the doc is asked in turn, with per-member answer rows (add team members by name) — importance of an A (1–5 slider), confident/weakest subject, individual goal, desired team role, meetings per week, submission timing vs deadline.
- Shared view that surfaces common themes: averages for the numeric questions and grouped answers so gaps are visible.
- Closing: one key takeaway and one commitment per member.
- Team-working checklist to tick before finishing, plus print/save for the whole session record.

All three are registered in `src/lib/exercises.ts` with slug, title, description, category, tags, minutes, and use the shared `_shared.tsx` primitives so styling matches the library.

## Part 2 — Continuing the Brilliant.org direction

Redesigning the four candidates flagged earlier, only where direct manipulation genuinely adds something:

- **Six Thinking Hats** — replace the pill row with a tactile hat carousel: a large coloured hat "worn" one at a time, coloured backdrop shifting with the hat, progress ring showing which hats are done, and a final board where all six perspectives sit side by side before the decision.
- **PERMA** — draggable dots on five radar spokes with a live-morphing polygon, matching the Wheel of Life / Self-Care Wheel treatment.
- **Box Breathing** — an animated ball tracing the four sides of a square in time with the 4-4-4-4 count, replacing the plain countdown, with cycle count and a calm/steady phase label.
- **Prioritization Matrix** — keep the pairwise engine, add a tournament-style live standings visual that reorders as comparisons are made, plus a final ranked bar chart.

Not redesigning: the journaling-led exercises (Thought Logging, Future Self, End-of-Year Review, Finding Passions, Self-Compassion, Chimp Brain, Rules & Assumptions, Challenging Rules, Reward Replacement, SMART Goals, As-If, Walk and Talk, High Standards, Perfectionism Hub, Project Breakdown, Idea Quickfire) — writing is the exercise there.

## Technical notes

- New files under `src/exercises/`, each a default-exported step-machine component using `useState`, following the existing pattern.
- Drag interactions reuse the pointer-event approach already used in Wheel of Life and Urgent/Important, with click/tap fallbacks for touch.
- Two new categories (Communication, Teamwork) appear automatically in the home-page filter, which derives categories from the catalogue.
- No backend; state stays local to the session, with print/save as the export path, consistent with the rest of the library.
