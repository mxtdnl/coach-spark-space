import { useState } from "react";
import { IntroGrid, PrimaryButton, TextArea } from "./_shared";

const DISTORTIONS = [
  { name: "All-or-nothing thinking", desc: "Black-and-white thinking — 'If I'm not perfect I've failed.'" },
  { name: "Over-generalising", desc: "'Nothing good ever happens' — drawing big conclusions from a single event." },
  { name: "Mental filter", desc: "Noticing only failures, missing the successes." },
  { name: "Disqualifying the positive", desc: "Discounting good things — 'That doesn't count.'" },
  { name: "Jumping to conclusions", desc: "Mind reading or fortune telling without evidence." },
  { name: "Magnification / minimisation", desc: "Blowing things out of proportion or shrinking them." },
  { name: "Emotional reasoning", desc: "'I feel it, so it must be true.'" },
  { name: "Should / must", desc: "'Should' statements that breed guilt and frustration." },
  { name: "Labelling", desc: "'I'm a loser' — assigning a global label from one event." },
  { name: "Personalisation", desc: "Blaming yourself for things that aren't fully your fault." },
] as const;

export default function CognitiveDistortions() {
  const [step, setStep] = useState<"intro" | "situation" | "identify" | "challenge" | "reframe" | "summary">("intro");
  const [situation, setSituation] = useState("");
  const [thought, setThought] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [facts, setFacts] = useState("");
  const [friend, setFriend] = useState("");
  const [reframe, setReframe] = useState("");

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="Identify and reframe common cognitive distortions — unhelpful thinking patterns that hurt mood, self-esteem, and decision-making."
            why="Distortions warp reality and create stress. Reframing builds healthier patterns and resilience over time."
            how={<ol className="list-decimal pl-4 space-y-1.5"><li>Name the situation and thought.</li><li>Identify the distortion(s).</li><li>Challenge and rewrite it.</li></ol>}
          />
          <PrimaryButton onClick={() => setStep("situation")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "situation" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">1. The situation and thought</h2>
          <div>
            <label className="text-sm font-medium">Recent situation where you felt stressed, anxious, or upset</label>
            <TextArea rows={3} value={situation} onChange={(e) => setSituation(e.target.value)} className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium">What thoughts came up?</label>
            <TextArea rows={3} value={thought} onChange={(e) => setThought(e.target.value)} className="mt-2" />
          </div>
          <div className="flex justify-end"><PrimaryButton onClick={() => setStep("identify")} disabled={!situation.trim() || !thought.trim()}>Next →</PrimaryButton></div>
        </section>
      )}

      {step === "identify" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">2. Which distortions are at play?</h2>
          <p className="text-sm text-muted-foreground">Tick all that match the thought you wrote.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {DISTORTIONS.map((d) => (
              <label key={d.name} className={`rounded-xl border p-4 cursor-pointer transition-colors ${selected[d.name] ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/40"}`}>
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={!!selected[d.name]} onChange={() => setSelected((p) => ({ ...p, [d.name]: !p[d.name] }))} className="mt-1 accent-[hsl(var(--primary))]" />
                  <div>
                    <h3 className="text-sm font-semibold">{d.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep("situation")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <PrimaryButton onClick={() => setStep("challenge")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "challenge" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">3. Challenge the thought</h2>
          <div>
            <label className="text-sm font-medium">Is this based on facts or assumptions? What evidence supports or refutes it?</label>
            <TextArea rows={4} value={facts} onChange={(e) => setFacts(e.target.value)} className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Would you think this about a friend in the same situation? What would you tell them?</label>
            <TextArea rows={4} value={friend} onChange={(e) => setFriend(e.target.value)} className="mt-2" />
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep("identify")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <PrimaryButton onClick={() => setStep("reframe")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "reframe" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">4. Reframe</h2>
          <p className="text-sm text-muted-foreground">Write a more balanced, fact-based version of the thought.</p>
          <TextArea rows={5} value={reframe} onChange={(e) => setReframe(e.target.value)} />
          <div className="flex justify-between">
            <button onClick={() => setStep("challenge")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <PrimaryButton onClick={() => setStep("summary")} disabled={!reframe.trim()}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Your reframed thought</h2>
          <Card label="Situation">{situation}</Card>
          <Card label="Original thought">{thought}</Card>
          <Card label="Distortions">{Object.entries(selected).filter(([, v]) => v).map(([k]) => k).join(" · ") || "—"}</Card>
          <Card label="Evidence">{facts}</Card>
          <Card label="What you'd tell a friend">{friend}</Card>
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Reframed thought</p>
            <p className="mt-2 text-base font-medium whitespace-pre-wrap">{reframe}</p>
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

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{children || "—"}</p>
    </div>
  );
}
