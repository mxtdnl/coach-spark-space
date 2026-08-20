import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";
import { DraggableRadar } from "./WheelOfLife";

const SLUG = "wheel-of-hult";

/** Total resource points a student can spend across the eight areas. */
const BUDGET = 35;
/** No single area can take more than this, so nothing can swallow the whole budget. */
const MAX_PER_AREA = 10;

/** The score keys are fixed so a student renaming "Other" never orphans their saved answers. */
const OTHER = "Other";

const AREAS = [
  {
    key: "Campus Engagement",
    hint: "Clubs and societies, campus events, ambassador or rep roles, using the spaces, staff and services on offer.",
  },
  {
    key: "Academic Performance",
    hint: "Attendance, coursework, exam preparation, seminar contribution, acting on the feedback you get.",
  },
  {
    key: "Career Progression",
    hint: "Internships and applications, CV and LinkedIn, employer events, networking, industry projects.",
  },
  {
    key: "Social Life",
    hint: "Friendships, flatmates, your cohort, and downtime that actually recharges you.",
  },
  {
    key: "Skills Development",
    hint: "Languages, coding, data, public speaking, certifications — capability beyond your grades.",
  },
  {
    key: "Health",
    hint: "Sleep, movement, food, alcohol, stress levels, and asking for support when you need it.",
  },
  {
    key: "Personal Development",
    hint: "Self-awareness, confidence, resilience, values, habits, money and independence.",
  },
  {
    key: OTHER,
    hint: "Anything the seven above miss — family, faith, a business you're building, caring responsibilities.",
  },
] as const;

const AREA_KEYS = AREAS.map((a) => a.key);

const REFLECTIONS = [
  {
    key: "cutting",
    label:
      "Which areas are you deliberately cutting back on, and what will that look like in practice?",
  },
  {
    key: "cost",
    label:
      "What does cutting back there actually cost you — and can you accept that cost for a month?",
  },
  { key: "surprise", label: "What surprised you about where your points went?" },
  { key: "support", label: "Who or what at Hult could help you with your top focus area?" },
] as const;

const RELATED = [
  { slug: "wheel-of-life", title: "Wheel of Life" },
  { slug: "smart-goals", title: "SMART Goals" },
  { slug: "prioritization-matrix", title: "Prioritization Matrix" },
] as const;

type Verdict = { label: string; note: string; tone: "focus" | "risk" | "coast" | "steady" };

/** Read one area's satisfaction against the resource it is getting next month. */
function verdictFor(satisfaction: number, points: number): Verdict {
  if (points >= 6 && satisfaction <= 4)
    return {
      label: "Turnaround focus",
      note: "Low right now, and you're backing it heavily. This is the change you're making.",
      tone: "focus",
    };
  if (points >= 6 && satisfaction >= 7)
    return {
      label: "Doubling down",
      note: "Already strong and still taking a big share. Worth checking that's a choice, not a comfort zone.",
      tone: "coast",
    };
  if (points <= 2 && satisfaction <= 4)
    return {
      label: "At risk",
      note: "Low satisfaction and almost no resource. Is that a conscious trade-off or a blind spot?",
      tone: "risk",
    };
  if (points >= 6)
    return {
      label: "Big bet",
      note: "Middling today and taking a large share of the month. This is where you should see movement.",
      tone: "focus",
    };
  if (points <= 2 && satisfaction >= 7)
    return {
      label: "Coasting",
      note: "Strong enough to run itself for a month. This is where your points came from.",
      tone: "steady",
    };
  if (satisfaction <= 4)
    return {
      label: "Modest push",
      note: "Struggling, and getting a middling share of the month. Is that enough to actually move it?",
      tone: "focus",
    };
  if (points <= 2)
    return {
      label: "Back burner",
      note: "Getting almost nothing next month. Fine if it can hold — worth watching if it's already slipping.",
      tone: "steady",
    };
  return {
    label: "Steady",
    note: "Ticking along with a moderate share of your attention.",
    tone: "steady",
  };
}

const TONE_CLASS: Record<Verdict["tone"], string> = {
  focus: "text-[var(--chart-1)]",
  risk: "text-destructive",
  coast: "text-foreground",
  steady: "text-muted-foreground",
};

type Scores = Record<string, number>;

const zeroed = () => Object.fromEntries(AREA_KEYS.map((k) => [k, 0])) as Scores;
const midpoint = () => Object.fromEntries(AREA_KEYS.map((k) => [k, 5])) as Scores;

export default function WheelOfHult() {
  const [step, setStep] = usePersistentState<
    "intro" | "rate" | "allocate" | "compare" | "actions" | "summary"
  >(SLUG, "step", "intro");
  const [otherLabel, setOtherLabel] = usePersistentState<string>(SLUG, "otherLabel", "");
  const [scores, setScores] = usePersistentState<Scores>(SLUG, "scores", midpoint);
  const [points, setPoints] = usePersistentState<Scores>(SLUG, "points", zeroed);
  const [notes, setNotes] = usePersistentState<Record<string, string>>(SLUG, "notes", {});
  const [actions, setActions] = usePersistentState<Record<string, string>>(SLUG, "actions", {});

  const otherName = otherLabel.trim() || OTHER;
  const labels = useMemo(() => AREA_KEYS.map((k) => (k === OTHER ? otherName : k)), [otherName]);
  const nameOf = (key: string) => (key === OTHER ? otherName : key);

  const spent = useMemo(() => AREA_KEYS.reduce((sum, k) => sum + (points[k] ?? 0), 0), [points]);
  const remaining = BUDGET - spent;

  /** The most any one area can hold right now: its own cap, and whatever budget is left. */
  const ceilingFor = (key: string) => Math.min(MAX_PER_AREA, (points[key] ?? 0) + remaining);

  const setPoint = (key: string, value: number) => {
    const next = Math.max(0, Math.min(ceilingFor(key), value));
    setPoints({ ...points, [key]: next });
  };

  /** Focus areas: most-funded first, and where points tie, the least satisfying area leads. */
  const focusAreas = useMemo(
    () =>
      AREA_KEYS.filter((k) => (points[k] ?? 0) > 0)
        .sort((a, b) => (points[b] ?? 0) - (points[a] ?? 0) || (scores[a] ?? 0) - (scores[b] ?? 0))
        .slice(0, 3),
    [points, scores],
  );

  const restart = () => {
    setScores(midpoint());
    setPoints(zeroed());
    setNotes({});
    setActions({});
    setOtherLabel("");
    setStep("intro");
  };

  const otherField = (
    <Field
      label={`Name your "${OTHER}" area`}
      hint="Optional. Whatever the seven fixed areas don't cover for you."
    >
      <TextInput
        value={otherLabel}
        onChange={(e) => setOtherLabel(e.target.value)}
        placeholder="e.g. Family, Faith, Side business, Caring responsibilities"
        maxLength={28}
      />
    </Field>
  );

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="Two wheels. The first is a snapshot of how your Hult life is going across eight areas. The second is how you'll spend a limited pot of attention on them over the next month."
            why="You cannot give everything your best at once. Seeing satisfaction and resource side by side turns a vague intention to 'do better' into an explicit trade-off you've actually chosen."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Rate your satisfaction in each of the eight areas.</li>
                <li>
                  Spend {BUDGET} resource points across them — {MAX_PER_AREA} max in any one area.
                </li>
                <li>Compare the two wheels and read the gaps.</li>
                <li>Commit to one concrete action per focus area.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("rate")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "rate" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Wheel 1 — how is it going?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag each dot along its spoke, or use the controls below. Outward = thriving (10).
              Inward = struggling (1). This is right now, not where you'd like to be.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex justify-center">
            <DraggableRadar
              scores={scores}
              setScores={setScores}
              categories={AREA_KEYS}
              labels={labels}
            />
          </div>

          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {AREAS.map((area) => (
              <AreaRow
                key={area.key}
                name={nameOf(area.key)}
                hint={area.hint}
                value={scores[area.key] ?? 5}
                min={1}
                max={10}
                onChange={(v) => setScores({ ...scores, [area.key]: v })}
              />
            ))}
          </div>

          {otherField}

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("allocate")}>
              Next: spend your points →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "allocate" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Wheel 2 — where does your focus go?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              You have {BUDGET} points of time, energy and attention for the next month —
              deliberately fewer than the {AREA_KEYS.length * MAX_PER_AREA} it would take to max out
              every area. No area can take more than {MAX_PER_AREA}. To give more somewhere, take it
              from somewhere else.
            </p>
          </div>

          <BudgetBar spent={spent} />

          <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex justify-center">
            <DraggableRadar
              scores={points}
              setScores={setPoints}
              categories={AREA_KEYS}
              labels={labels}
              min={0}
              color="var(--chart-1)"
              clampValue={(i, v) => Math.min(v, ceilingFor(AREA_KEYS[i]))}
            />
          </div>

          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {AREAS.map((area) => (
              <AreaRow
                key={area.key}
                name={nameOf(area.key)}
                hint={`Satisfaction ${scores[area.key] ?? 5}/10`}
                value={points[area.key] ?? 0}
                min={0}
                max={ceilingFor(area.key)}
                hardMax={MAX_PER_AREA}
                onChange={(v) => setPoint(area.key, v)}
              />
            ))}
          </div>

          {remaining > 0 && (
            <p className="text-sm text-muted-foreground">
              You still have {remaining} {remaining === 1 ? "point" : "points"} unspent. Unspent
              attention tends to leak into whatever shouts loudest — spend it on purpose.
            </p>
          )}

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("rate")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("compare")} disabled={spent === 0}>
              Next: compare the wheels →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "compare" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Where the two wheels disagree</h2>
            <p className="text-sm text-muted-foreground mt-1">
              The gaps are the interesting part: areas you rated low that are getting nothing, and
              areas already strong that are still taking your points.
            </p>
          </div>

          <WheelPair scores={scores} points={points} labels={labels} />
          <OverlayWheel scores={scores} points={points} labels={labels} />
          <GapTable scores={scores} points={points} nameOf={nameOf} />

          <div className="space-y-4">
            {REFLECTIONS.map((r) => (
              <Field key={r.key} label={r.label}>
                <TextArea
                  rows={3}
                  value={notes[r.key] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [r.key]: e.target.value })}
                />
              </Field>
            ))}
          </div>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("allocate")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("actions")}>
              Next: commit to actions →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "actions" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your focus areas this month</h2>
            <p className="text-sm text-muted-foreground mt-1">
              These are the {focusAreas.length === 1 ? "area" : "areas"} you funded most. Points
              only mean something if they turn into something you actually do.
            </p>
          </div>

          {focusAreas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven't spent any points yet — go back and allocate them first.
            </p>
          ) : (
            <div className="space-y-4">
              {focusAreas.map((key) => (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold">{nameOf(key)}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {points[key]} pts · satisfaction {scores[key]}/10
                    </span>
                  </div>
                  <Field
                    label="What will you actually do in the next month?"
                    hint="Something specific enough that you'd know by the end of the month whether you did it."
                  >
                    <TextArea
                      rows={3}
                      value={actions[key] ?? ""}
                      onChange={(e) => setActions({ ...actions, [key]: e.target.value })}
                      placeholder="e.g. Go to two society events and sign up to one committee before the end of the month."
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("compare")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your Wheel of Hult</h2>
          <p className="text-sm text-muted-foreground">
            Satisfaction today, and the {spent} of {BUDGET} points you've committed for the next
            month.
          </p>

          <WheelPair scores={scores} points={points} labels={labels} />
          <OverlayWheel scores={scores} points={points} labels={labels} />
          <GapTable scores={scores} points={points} nameOf={nameOf} />

          {focusAreas.some((k) => actions[k]) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                This month you will
              </h3>
              {focusAreas.map(
                (key) =>
                  actions[key] && (
                    <div key={key} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        {nameOf(key)} · {points[key]} pts
                      </p>
                      <p className="mt-2 text-sm whitespace-pre-wrap">{actions[key]}</p>
                    </div>
                  ),
              )}
            </div>
          )}

          {REFLECTIONS.some((r) => notes[r.key]) && (
            <div className="grid gap-3 md:grid-cols-2">
              {REFLECTIONS.map(
                (r) =>
                  notes[r.key] && (
                    <div key={r.key} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        {r.label}
                      </p>
                      <p className="mt-2 text-sm whitespace-pre-wrap">{notes[r.key]}</p>
                    </div>
                  ),
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Come back in a month, re-rate the first wheel, and see whether the areas you funded
              actually moved.
            </p>
            <div className="flex flex-wrap gap-2">
              {RELATED.map((r) => (
                <Link
                  key={r.slug}
                  to="/exercise/$slug"
                  params={{ slug: r.slug }}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"
                >
                  {r.title} →
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("actions")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
            <GhostButton onClick={restart}>Start again</GhostButton>
          </div>
        </section>
      )}
    </div>
  );
}

/** One keyboard-operable row: the accessible equivalent of dragging a spoke. */
function AreaRow({
  name,
  hint,
  value,
  min,
  max,
  hardMax,
  onChange,
}: {
  name: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  /** The per-area cap, when it differs from the currently reachable max (budget-limited). */
  hardMax?: number;
  onChange: (value: number) => void;
}) {
  const capped = hardMax !== undefined && max < hardMax;
  return (
    <div className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="min-w-[12rem] flex-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <GhostButton
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Decrease ${name}`}
        >
          −
        </GhostButton>
        <input
          type="number"
          min={min}
          max={hardMax ?? max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={name}
          className="w-14 rounded-md border border-input bg-card px-2 py-1.5 text-sm text-center outline-none focus:ring-2 focus:ring-ring"
        />
        <GhostButton
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Increase ${name}`}
        >
          +
        </GhostButton>
      </div>
      {capped && (
        <span className="text-xs text-muted-foreground w-full sm:w-auto">No points left</span>
      )}
    </div>
  );
}

function BudgetBar({ spent }: { spent: number }) {
  const remaining = BUDGET - spent;
  const pct = Math.min(100, (spent / BUDGET) * 100);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">
          {spent} of {BUDGET} points spent
        </p>
        <p
          className={`text-sm font-semibold ${remaining === 0 ? "text-muted-foreground" : "text-[var(--chart-1)]"}`}
        >
          {remaining} left
        </p>
      </div>
      <div
        className="mt-3 h-2 w-full rounded-full bg-secondary overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={BUDGET}
        aria-valuenow={spent}
        aria-label="Resource points spent"
      >
        <div
          className="h-full rounded-full transition-[width] duration-200"
          style={{ width: `${pct}%`, background: "var(--chart-1)" }}
        />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-4 rounded-full"
          style={{ background: "var(--primary)" }}
        />{" "}
        Satisfaction now
      </span>
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-4 rounded-full"
          style={{ background: "var(--chart-1)" }}
        />{" "}
        Points next month
      </span>
    </div>
  );
}

function WheelPair({
  scores,
  points,
  labels,
}: {
  scores: Scores;
  points: Scores;
  labels: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Satisfaction now
        </p>
        <div className="mt-2 flex justify-center">
          <DraggableRadar
            scores={scores}
            setScores={() => {}}
            categories={AREA_KEYS}
            labels={labels}
            readOnly
          />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Points next month
        </p>
        <div className="mt-2 flex justify-center">
          <DraggableRadar
            scores={points}
            setScores={() => {}}
            categories={AREA_KEYS}
            labels={labels}
            readOnly
            color="var(--chart-1)"
          />
        </div>
      </div>
    </div>
  );
}

function OverlayWheel({
  scores,
  points,
  labels,
}: {
  scores: Scores;
  points: Scores;
  labels: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        Both wheels together
      </p>
      <div className="flex justify-center">
        <DraggableRadar
          scores={points}
          setScores={() => {}}
          categories={AREA_KEYS}
          labels={labels}
          readOnly
          color="var(--chart-1)"
          overlay={{ scores, color: "var(--primary)" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Each spoke is labelled points · satisfaction.</p>
      <Legend />
    </div>
  );
}

function GapTable({
  scores,
  points,
  nameOf,
}: {
  scores: Scores;
  points: Scores;
  nameOf: (key: string) => string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="p-3 font-semibold">Area</th>
            <th className="p-3 font-semibold whitespace-nowrap">Satisfaction</th>
            <th className="p-3 font-semibold whitespace-nowrap">Points</th>
            <th className="p-3 font-semibold">Read</th>
          </tr>
        </thead>
        <tbody>
          {AREA_KEYS.map((key) => {
            const s = scores[key] ?? 5;
            const p = points[key] ?? 0;
            const v = verdictFor(s, p);
            return (
              <tr key={key} className="border-b border-border last:border-0 align-top">
                <td className="p-3 font-medium">{nameOf(key)}</td>
                <td className="p-3 tabular-nums">{s}/10</td>
                <td className="p-3 tabular-nums">{p}</td>
                <td className="p-3">
                  <span className={`font-semibold ${TONE_CLASS[v.tone]}`}>{v.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{v.note}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
