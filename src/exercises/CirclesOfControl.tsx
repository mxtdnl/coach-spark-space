import { useState } from "react";
import { IntroGrid, PrimaryButton, TextArea } from "./_shared";



type Items = { control: string; influence: string; concern: string };

const PLACEHOLDERS: Record<keyof Items, string> = {
  control: "e.g. Time I dedicate to writing, the effort I put in",
  influence: "e.g. Asking for feedback, getting another person to review it",
  concern: "e.g. The deadline, what my professor thinks, the final grade",
};

const LABELS: Record<keyof Items, { title: string; sub: string; color: string }> = {
  control: { title: "Circle of Control", sub: "Fully within my power", color: "bg-primary/15 border-primary/40" },
  influence: { title: "Circle of Influence", sub: "I can affect but not decide", color: "bg-secondary border-border" },
  concern: { title: "Circle of Concern", sub: "Outside my power — let go", color: "bg-muted/40 border-border" },
};

type Step = "intro" | "problem" | "sort" | "action" | "summary";

export default function CirclesOfControl() {
  const [step, setStep] = useState<Step>("intro");
  const [problem, setProblem] = useState("");
  const [items, setItems] = useState<Items>({ control: "", influence: "", concern: "" });
  const [action, setAction] = useState("");
  const [letGo, setLetGo] = useState("");

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <Intro />
          <button onClick={() => setStep("problem")} className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Start the exercise →
          </button>
        </section>
      )}

      {step === "problem" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">1. Identify the problem</h2>
          <p className="text-sm text-muted-foreground">Be as specific as possible about what's causing stress or concern.</p>
          <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={4} placeholder="e.g. Stress about a big report due this week" className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <div className="flex justify-end">
            <button disabled={!problem.trim()} onClick={() => setStep("sort")} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40">
              Next →
            </button>
          </div>
        </section>
      )}

      {step === "sort" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">2. Sort into three circles</h2>
          <p className="text-sm text-muted-foreground">For each circle, list the aspects of your problem that fit.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(LABELS) as (keyof Items)[]).map((k) => (
              <div key={k} className={`rounded-xl border p-4 ${LABELS[k].color}`}>
                <h3 className="text-sm font-semibold">{LABELS[k].title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{LABELS[k].sub}</p>
                <textarea value={items[k]} onChange={(e) => setItems({ ...items, [k]: e.target.value })} rows={6} placeholder={PLACEHOLDERS[k]} className="mt-3 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep("problem")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <button onClick={() => setStep("action")} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Next →</button>
          </div>
        </section>
      )}

      {step === "action" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">3. Take action & let go</h2>
          <div>
            <label className="text-sm font-medium">Small, actionable steps from what you control or influence</label>
            <textarea value={action} onChange={(e) => setAction(e.target.value)} rows={4} placeholder="What's the first step you can take?" className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">How will you let go of what's outside your control?</label>
            <textarea value={letGo} onChange={(e) => setLetGo(e.target.value)} rows={4} placeholder="An affirmation, reminder, or practice" className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep("sort")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <button onClick={() => setStep("summary")} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">See summary →</button>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your circles</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Problem</p>
            <p className="mt-1 text-sm">{problem}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(LABELS) as (keyof Items)[]).map((k) => (
              <div key={k} className={`rounded-xl border p-4 ${LABELS[k].color}`}>
                <h3 className="text-sm font-semibold">{LABELS[k].title}</h3>
                <p className="mt-2 text-sm whitespace-pre-wrap">{items[k] || <span className="text-muted-foreground italic">—</span>}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Action steps</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{action || "—"}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Letting go</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{letGo || "—"}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setStep("intro")} className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">Start over</button>
            <button onClick={() => window.print()} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Print / Save PDF</button>
          </div>
        </section>
      )}
    </div>
  );
}

function Intro() {
  return (
    <IntroGrid
      what={<>Separate your concerns into three groups: what you can <strong>control</strong>, what you can <strong>influence</strong>, and what is <strong>outside</strong> your control — so you focus energy on what's productive.</>}
      why="Stress is amplified when we focus on what we can't change. Letting go of the uncontrollable frees up energy for meaningful action."
      how={<ol className="list-decimal pl-4 space-y-1.5"><li>Name the problem.</li><li>Sort it into the three circles.</li><li>Plan action on what you can; release the rest.</li></ol>}
    />
  );
}

