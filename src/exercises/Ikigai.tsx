import { useState } from "react";
import { GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const QUADRANTS = [
  { key: "love", label: "What you love", sub: "Passion", hint: "Activities that make you feel alive and joyful. Nothing is too small." },
  { key: "good", label: "What you're good at", sub: "Vocation", hint: "Your talents and natural strengths." },
  { key: "world", label: "What the world needs", sub: "Mission", hint: "How you can make a positive impact — community, peers, the wider world." },
  { key: "paid", label: "What you can be paid for", sub: "Profession", hint: "Where your skills meet a market or opportunity." },
] as const;

export default function Ikigai() {
  const [step, setStep] = useState<"intro" | "fill" | "overlap" | "summary">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [overlap, setOverlap] = useState("");

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A reflection on what you love, what you're good at, what the world needs, and what you can be paid for."
            why="Aligning passion, mission, vocation, and profession gives life meaning and motivation — a reason to jump out of bed."
            how={<ol className="list-decimal pl-4 space-y-1.5"><li>Fill in each of the four quadrants.</li><li>Look for overlaps — where two or more meet.</li><li>Notice what your ikigai might be.</li></ol>}
          />
          <PrimaryButton onClick={() => setStep("fill")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "fill" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">The four circles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {QUADRANTS.map((q) => (
              <div key={q.key} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{q.sub}</p>
                <h3 className="text-base font-semibold mt-0.5">{q.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{q.hint}</p>
                <TextArea rows={5} className="mt-3" value={answers[q.key] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("overlap")}>Find your ikigai →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "overlap" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your overlaps</h2>
          <IkigaiDiagram />
          <p className="text-sm text-muted-foreground">Look at your four answers. What themes or words appear in more than one quadrant? The overlap is where your ikigai begins to take shape.</p>
          <TextArea rows={5} placeholder="Where do your answers overlap? What do you notice?" value={overlap} onChange={(e) => setOverlap(e.target.value)} />
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("fill")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your ikigai sketch</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {QUADRANTS.map((q) => answers[q.key] && (
              <div key={q.key} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{q.sub} · {q.label}</p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{answers[q.key]}</p>
              </div>
            ))}
            {overlap && (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Ikigai — where it overlaps</p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{overlap}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("overlap")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}

function IkigaiDiagram() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex justify-center">
      <svg viewBox="0 0 320 320" className="w-full max-w-[360px]" role="img" aria-label="Ikigai overlapping circles">
        <g fill="hsl(var(--primary))" fillOpacity={0.18} stroke="hsl(var(--primary))" strokeWidth={1.5}>
          <circle cx="130" cy="120" r="90" />
          <circle cx="190" cy="120" r="90" />
          <circle cx="130" cy="200" r="90" />
          <circle cx="190" cy="200" r="90" />
        </g>
        <g className="fill-foreground" fontSize={11} fontWeight={600} textAnchor="middle">
          <text x="80" y="60">What you love</text>
          <text x="240" y="60">What the world needs</text>
          <text x="80" y="290">What you're good at</text>
          <text x="240" y="290">What you can be paid for</text>
          <text x="160" y="165" fontSize={13}>Ikigai</text>
        </g>
      </svg>
    </div>
  );
}
