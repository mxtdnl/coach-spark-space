import { useMemo, useState } from "react";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextInput } from "./_shared";

const VALUES = [
  "Abundance","Acceptance","Accountability","Achievement","Adventure","Advocacy","Ambition","Appreciation","Attractiveness","Autonomy","Balance","Being the Best","Benevolence","Boldness","Brilliance","Calmness","Caring","Challenge","Charity","Cheerfulness","Cleverness","Community","Commitment","Compassion","Cooperation","Collaboration","Consistency","Contribution","Creativity","Credibility","Curiosity","Daring","Decisiveness","Dedication","Dependability","Diversity","Empathy","Encouragement","Enthusiasm","Ethics","Excellence","Expressiveness","Fairness","Family","Friendships","Flexibility","Freedom","Fun","Generosity","Grace","Growth","Happiness","Health","Honesty","Humility","Humor","Inclusiveness","Independence","Individuality","Innovation","Inspiration","Intelligence","Intuition","Joy","Kindness","Knowledge","Leadership","Learning","Love","Loyalty","Making a Difference","Mindfulness","Motivation","Optimism","Open-Mindedness","Originality","Passion","Peace","Perfection","Performance","Personal Development","Playfulness","Popularity","Power","Preparedness","Proactivity","Professionalism","Punctuality","Quality","Recognition","Relationships","Reliability","Resilience","Resourcefulness","Responsibility","Responsiveness","Risk Taking","Safety","Security","Self-Control","Selflessness","Service","Simplicity","Spirituality","Stability","Success","Teamwork","Thankfulness","Thoughtfulness","Traditionalism","Trustworthiness","Understanding","Uniqueness","Usefulness","Versatility","Vision","Warmth","Wealth","Well-Being","Wisdom","Zeal",
];

type FinalValue = { id: string; word: string; action: string };

export default function CoreValues() {
  const [step, setStep] = useState<"intro" | "select" | "group" | "rank" | "summary">("intro");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState("");
  const [finals, setFinals] = useState<FinalValue[]>([
    { id: "1", word: "", action: "" },
    { id: "2", word: "", action: "" },
    { id: "3", word: "", action: "" },
    { id: "4", word: "", action: "" },
    { id: "5", word: "", action: "" },
  ]);

  const toggle = (v: string) => {
    const next = new Set(selected);
    next.has(v) ? next.delete(v) : next.add(v);
    setSelected(next);
  };
  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    setSelected(new Set([...selected, v]));
    setCustom("");
  };

  const updateFinal = (idx: number, patch: Partial<FinalValue>) =>
    setFinals((f) => f.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= finals.length) return;
    const next = [...finals];
    [next[idx], next[j]] = [next[j], next[idx]];
    setFinals(next);
  };

  const selectedList = useMemo(() => [...selected].sort(), [selected]);

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="Clarify and prioritize your core values so your decisions and goals align with what matters."
            why="When you act in line with your values, you feel confident and purposeful. When you don't, you feel lost or stressed."
            how={<ol className="list-decimal pl-4 space-y-1.5"><li>Pick the values that resonate.</li><li>Group them into up to five themes.</li><li>Add a verb and rank them.</li></ol>}
          />
          <PrimaryButton onClick={() => setStep("select")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "select" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Step 1 · Pick what resonates</h2>
            <p className="text-sm text-muted-foreground mt-1">Don't overthink. If a word feels important, include it. <span className="font-medium text-foreground">{selected.size} selected.</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            {VALUES.map((v) => {
              const on = selected.has(v);
              return (
                <button key={v} onClick={() => toggle(v)} className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-secondary"}`}>
                  {v}
                </button>
              );
            })}
            {[...selected].filter((v) => !VALUES.includes(v)).map((v) => (
              <button key={v} onClick={() => toggle(v)} className="rounded-full border px-3 py-1.5 text-sm bg-primary text-primary-foreground border-primary">
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <TextInput placeholder="Add your own value…" value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()} />
            <GhostButton onClick={addCustom}>Add</GhostButton>
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton disabled={selected.size === 0} onClick={() => setStep("group")}>Group them →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "group" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Step 2 · Group & name</h2>
            <p className="text-sm text-muted-foreground mt-1">Cluster your picks into themes. Choose one word (or a new one) per theme, then add a verb so it becomes actionable. e.g. "practise honesty in all relationships".</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Your selection</p>
            <p className="text-sm">{selectedList.join(" · ")}</p>
          </div>
          <div className="space-y-3">
            {finals.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-[1fr_2fr]">
                <Field label={`Value ${i + 1}`}>
                  <TextInput value={f.word} onChange={(e) => updateFinal(i, { word: e.target.value })} placeholder="e.g. Honesty" />
                </Field>
                <Field label="As an action">
                  <TextInput value={f.action} onChange={(e) => updateFinal(i, { action: e.target.value })} placeholder="e.g. Speak with honesty, even when it's hard" />
                </Field>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("select")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("rank")}>Rank them →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "rank" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Step 3 · Rank by importance</h2>
            <p className="text-sm text-muted-foreground mt-1">Order matters most when values conflict. Use the arrows to reorder.</p>
          </div>
          <ol className="space-y-2">
            {finals.filter((f) => f.word).map((f, i, arr) => {
              const realIdx = finals.indexOf(f);
              return (
                <li key={f.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
                  <span className="font-semibold text-lg w-6 text-center text-muted-foreground tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{f.word}</p>
                    {f.action && <p className="text-xs text-muted-foreground truncate">{f.action}</p>}
                  </div>
                  <GhostButton disabled={i === 0} onClick={() => move(realIdx, -1)}>↑</GhostButton>
                  <GhostButton disabled={i === arr.length - 1} onClick={() => move(realIdx, 1)}>↓</GhostButton>
                </li>
              );
            })}
          </ol>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("group")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>Finish →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your core values</h2>
          <ol className="space-y-3">
            {finals.filter((f) => f.word).map((f, i) => (
              <li key={f.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                  <div>
                    <p className="text-lg font-semibold">{f.word}</p>
                    {f.action && <p className="text-sm text-muted-foreground mt-1">{f.action}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("rank")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
