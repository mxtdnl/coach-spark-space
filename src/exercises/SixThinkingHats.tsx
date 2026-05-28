import { useState } from "react";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

const HATS = [
  { key: "blue", name: "Blue · Process", color: "#3b82f6", desc: "Manage the discussion. What's the goal? How will you bring this together?", prompts: ["What's the goal of this thinking?", "How will I structure the steps?", "What does success look like?"] },
  { key: "white", name: "White · Facts", color: "#e5e7eb", desc: "Stay objective. Only what you know, and what info is missing.", prompts: ["What do I know for sure?", "What information is missing?", "What does the evidence say?"] },
  { key: "red", name: "Red · Feelings", color: "#ef4444", desc: "Gut reactions and emotions. No justification needed.", prompts: ["How do I feel about this?", "What's my instinct telling me?", "What excites or worries me?"] },
  { key: "black", name: "Black · Caution", color: "#111827", desc: "Risks, weaknesses, problems. Not negativity for its own sake.", prompts: ["What might go wrong?", "What are the risks?", "Why might this fail?"] },
  { key: "yellow", name: "Yellow · Optimism", color: "#f59e0b", desc: "Value and benefits. Why this could work.", prompts: ["What are the advantages?", "What positive outcomes are possible?", "Why might this succeed?"] },
  { key: "green", name: "Green · Creativity", color: "#10b981", desc: "New ideas, alternatives, wild possibilities. Don't filter.", prompts: ["What's another way?", "What unusual ideas come up?", "How could we innovate?"] },
] as const;

export default function SixThinkingHats() {
  const [step, setStep] = useState<"intro" | "problem" | "hats" | "decide" | "summary">("intro");
  const [problem, setProblem] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [hatIdx, setHatIdx] = useState(0);
  const [decision, setDecision] = useState("");

  const hat = HATS[hatIdx];

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A structured way to look at a problem or decision from six distinct perspectives — one 'hat' at a time."
            why="We get stuck in one mode of thinking. Forcing each lens reduces bias and uncovers angles you'd miss."
            how={<ol className="list-decimal pl-4 space-y-1.5"><li>Name the problem or decision.</li><li>Wear each hat in turn — keep perspectives separate.</li><li>Bring it together into an action.</li></ol>}
          />
          <PrimaryButton onClick={() => setStep("problem")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "problem" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">What are you thinking about?</h2>
          <Field label="The problem or decision">
            <TextInput value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. Should I take on this internship offer?" />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton disabled={!problem.trim()} onClick={() => { setHatIdx(0); setStep("hats"); }}>Put on the first hat →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "hats" && (
        <section className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {HATS.map((h, i) => (
              <button key={h.key} onClick={() => setHatIdx(i)} className={`rounded-full border px-3 py-1.5 text-xs transition ${i === hatIdx ? "border-primary bg-primary/10 font-semibold" : "border-border bg-card hover:bg-secondary"}`}>
                <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: h.color }} />
                {h.name.split(" · ")[0]}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: hat.color }} />
              <h2 className="text-xl font-semibold">{hat.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{hat.desc}</p>
            <ul className="mt-3 text-sm list-disc pl-5 space-y-0.5 text-muted-foreground">
              {hat.prompts.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <TextArea rows={6} className="mt-4" placeholder={`Thinking from the ${hat.name.split(" · ")[0]} hat about: ${problem}`} value={notes[hat.key] ?? ""} onChange={(e) => setNotes({ ...notes, [hat.key]: e.target.value })} />
          </div>
          <div className="flex justify-between gap-2">
            <GhostButton onClick={() => hatIdx === 0 ? setStep("problem") : setHatIdx(hatIdx - 1)}>← {hatIdx === 0 ? "Back" : "Previous hat"}</GhostButton>
            {hatIdx < HATS.length - 1
              ? <PrimaryButton onClick={() => setHatIdx(hatIdx + 1)}>Next hat →</PrimaryButton>
              : <PrimaryButton onClick={() => setStep("decide")}>Decide →</PrimaryButton>}
          </div>
        </section>
      )}

      {step === "decide" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Pull it together</h2>
          <p className="text-sm text-muted-foreground">Review the perspectives. What's your decision or next step? What further information do you need?</p>
          <Field label="Decision or next action">
            <TextArea rows={5} value={decision} onChange={(e) => setDecision(e.target.value)} />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("hats")}>← Back to hats</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">{problem || "Your thinking"}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {HATS.map((h) => notes[h.key] && (
              <div key={h.key} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: h.color }} />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{h.name}</p>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{notes[h.key]}</p>
              </div>
            ))}
            {decision && (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Decision · next action</p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{decision}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("decide")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
