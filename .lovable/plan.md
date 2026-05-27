## Goal

Turn the current single-exercise app into a **library of interactive coaching exercises**. You send me PDFs, I hand-build each one as a bespoke interactive page, and they all live together under one browsable site with categories and tags.

## What you'll see

**1. Library home (`/`)**
- Header with the library name + short intro
- Search box (filters by title/description)
- Category filter chips (e.g. Prioritization, Reflection, Goal-setting, Decision-making — we'll grow this list as exercises arrive)
- Grid of exercise cards, each showing: title, short description, category, tags, estimated time, and a "Start" button

**2. Exercise page (`/exercise/[slug]`)**
- Bespoke interactive flow tailored to that PDF (like the current Prioritization Matrix)
- "Back to library" link in the header
- Print / save options where appropriate

**3. Existing Prioritization Matrix**
- Moves to `/exercise/prioritization-matrix` unchanged
- Becomes the first card in the library

## How new PDFs get added

Workflow per PDF you send:
1. You upload the PDF in chat (one or several at a time is fine)
2. I parse it, design the interactive flow, and confirm with you if anything's ambiguous
3. I build it as its own route + component, register it in the exercise catalogue, and tag/categorise it
4. It appears in the library immediately

Because the PDFs are varied (worksheets, canvases, reflection prompts, scoring tools, etc.), each one gets a hand-built UI rather than a one-size-fits-all template — this keeps the quality high, the way the Prioritization Matrix turned out.

## Saving answers

Session-only, as you chose — answers live while the tab is open and reset on close. No accounts, no backend needed. We can revisit this later if you want students to come back to in-progress work.

## Technical section

- **Catalogue**: a single `src/lib/exercises.ts` registry — each entry has `slug`, `title`, `description`, `category`, `tags`, `estimatedMinutes`, and a lazy-loaded component reference. Adding an exercise = adding one entry + one route file.
- **Routes**: `src/routes/index.tsx` becomes the library landing page; exercises move to `src/routes/exercise.$slug.tsx` (or one file per exercise under `src/routes/exercise/`) — each with its own SEO `head()`.
- **Filtering**: category + search state stored in URL search params so links are shareable.
- **Styling**: reuse the existing design tokens in `src/styles.css` so every exercise feels part of the same product.
- **No backend**: nothing requires Lovable Cloud at this stage.

## What I need from you to start

1. A **name** for the library (e.g. "Coach Spark", "[Your Name]'s Coaching Toolkit") — or I'll suggest a few.
2. The **PDFs** themselves — send whenever ready, in any order. I'll digitise them one at a time (or in small batches) and they'll appear on the home page as I go.
3. An initial **category list** if you have one in mind, otherwise I'll propose categories based on the first batch of PDFs.

Approve this plan and I'll set up the library shell (home page + routing + catalogue) with the Prioritization Matrix as the first entry, ready for you to start sending more PDFs.